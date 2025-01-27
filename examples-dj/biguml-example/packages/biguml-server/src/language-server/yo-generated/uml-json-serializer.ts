import { CrossReference } from 'generator-langium-model-management';
import {
    AstNode,
    AstNodeLocator,
    CstNode,
    DocumentSegment,
    GenericAstNode,
    LangiumDocuments,
    LangiumServices,
    Mutable,
    NameProvider,
    Reference,
    findNodesForProperty,
    getDocument,
    isAstNode,
    isReference,
    streamAst
} from 'langium';
import { URI } from 'vscode-uri';
import { properties } from '../../../generator-config.js';

export interface JsonSerializeOptions {
    space?: string | number;
    refText?: boolean;
    sourceText?: boolean;
    textRegions?: boolean;
    replacer?: (key: string, value: unknown, defaultReplacer: (key: string, value: unknown) => unknown) => unknown;
}

/**
 * {@link AstNode}s that may carry information on their definition area within the DSL text.
 */
export interface AstNodeWithTextRegion extends AstNode {
    $sourceText?: string;
    $textRegion?: AstNodeRegionWithAssignments;
}

/**
 * A {@DocumentSegment} representing the definition area of an AstNode within the DSL text.
 * Usually contains text region information on all assigned property values of the AstNode,
 * and may contain the defining file's URI as string.
 */
export interface AstNodeRegionWithAssignments extends DocumentSegment {
    /**
     * A record containing an entry for each assignd property of the AstNode.
     * The key is equal to the property name and the value is an array of the property values'
     * text regions, regardless of whether the property is a single value or list property.
     */
    assignments?: Record<string, DocumentSegment[]>;
    /**
     * The AstNode defining file's URI as string
     */
    documentURI?: string;
}

/**
 * Utility service for transforming an `AstNode` into a JSON string and vice versa.
 */
export interface JsonSerializer {
    /**
     * Serialize an `AstNode` into a JSON `string`.
     * @param node The `AstNode` to be serialized.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    serialize(node: AstNode, options?: JsonSerializeOptions): string;
    /**
     * Deserialize (parse) a JSON `string` into an `AstNode`.
     */
    deserialize(content: string): AstNode;
}

interface IntermediateReference {
    $refText?: string;
    $ref?: CrossReference<AstNode>;
    $error?: string;
}

function isIntermediateReference(obj: unknown): obj is IntermediateReference {
    return typeof obj === 'object' && !!obj && ('$ref' in obj || '$error' in obj);
}

export class UmlJsonSerializer implements JsonSerializer {
    protected ignoreProperties = new Set(['$container', '$containerProperty', '$containerIndex', '$document', '$cstNode']);
    protected readonly astNodeLocator: AstNodeLocator;
    protected readonly nameProvider: NameProvider;
    protected readonly langiumDocs: LangiumDocuments;

    constructor(services: LangiumServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nameProvider = services.references.NameProvider;
        this.langiumDocs = services.shared.workspace.LangiumDocuments;
    }

    serialize(node: AstNode, options?: JsonSerializeOptions): string {
        const specificReplacer = options?.replacer;
        const defaultReplacer = (key: string, value: unknown) => this.replacer(key, value, options);
        const replacer = specificReplacer
            ? (key: string, value: unknown) => specificReplacer(key, value, defaultReplacer)
            : defaultReplacer;

        const str = JSON.stringify(node, replacer, options?.space);
        console.log(str);
        return str;
    }

    deserialize(content: string): AstNode {
        const root = JSON.parse(content);
        this.linkNode(root, root);
        return root;
    }

    protected replacer(key: string, value: unknown, { refText, sourceText, textRegions }: JsonSerializeOptions = {}): unknown {
        if (this.ignoreProperties.has(key)) {
            return undefined;
        } else if (isReference(value)) {
            const refValue = value.ref;
            const $refText = refText ? value.$refText : undefined;
            if (refValue) {
                if ((refValue as any)[properties.referenceProperty]) {
                    return {
                        $refText,
                        $ref: {
                            __documentUri: value.$nodeDescription?.node ? undefined : value.$nodeDescription?.documentUri.path,
                            __id: (refValue as any)[properties.referenceProperty]
                        }
                    } as unknown as IntermediateReference;
                }
                return {
                    $refText,
                    $ref: {
                        __documentUri: value.$nodeDescription?.node ? undefined : value.$nodeDescription?.documentUri.path,
                        __path: refValue && this.astNodeLocator.getAstNodePath(refValue)
                    }
                } as unknown as IntermediateReference;
            } else {
                return {
                    $refText,
                    $error: value.error?.message ?? 'Could not resolve reference'
                };
            }
        } else {
            let astNode: AstNodeWithTextRegion | undefined = undefined;
            if (textRegions && isAstNode(value)) {
                astNode = this.addAstNodeRegionWithAssignmentsTo({ ...value });
                if ((!key || value.$document) && astNode?.$textRegion) {
                    try {
                        astNode.$textRegion.documentURI = getDocument(value).uri.path;
                    } catch (e) {
                        /* do nothing */
                    }
                }
            }
            if (sourceText && !key && isAstNode(value)) {
                astNode ??= { ...value };
                astNode.$sourceText = value.$cstNode?.text;
            }
            return astNode ?? value;
        }
    }

    protected addAstNodeRegionWithAssignmentsTo(node: AstNodeWithTextRegion) {
        const createDocumentSegment: (cstNode: CstNode) => AstNodeRegionWithAssignments = cstNode =>
            <DocumentSegment>{
                offset: cstNode.offset,
                end: cstNode.end,
                length: cstNode.length,
                range: cstNode.range
            };

        if (node.$cstNode) {
            const textRegion = (node.$textRegion = createDocumentSegment(node.$cstNode));
            const assignments: Record<string, DocumentSegment[]> = (textRegion.assignments = {});

            Object.keys(node)
                .filter(key => !key.startsWith('$'))
                .forEach(key => {
                    const propertyAssignments = findNodesForProperty(node.$cstNode, key).map(createDocumentSegment);
                    if (propertyAssignments.length !== 0) {
                        assignments[key] = propertyAssignments;
                    }
                });

            return node;
        }
        return undefined;
    }

    protected linkNode(node: GenericAstNode, root: AstNode, container?: AstNode, containerProperty?: string, containerIndex?: number) {
        for (const [propertyName, item] of Object.entries(node)) {
            if (Array.isArray(item)) {
                for (let index = 0; index < item.length; index++) {
                    const element = item[index];
                    if (isIntermediateReference(element)) {
                        item[index] = this.reviveReference(node, propertyName, root, element);
                    } else if (isAstNode(element)) {
                        this.linkNode(element as GenericAstNode, root, node, propertyName, index);
                    }
                }
            } else if (isIntermediateReference(item)) {
                node[propertyName] = this.reviveReference(node, propertyName, root, item);
            } else if (isAstNode(item)) {
                this.linkNode(item as GenericAstNode, root, node, propertyName);
            }
        }
        const mutable = node as Mutable<GenericAstNode>;
        mutable.$container = container;
        mutable.$containerProperty = containerProperty;
        mutable.$containerIndex = containerIndex;
    }

    protected reviveReference(
        container: AstNode,
        property: string,
        root: AstNode,
        reference: IntermediateReference
    ): Reference | undefined {
        let refText = reference.$refText;
        if (reference.$ref) {
            const ref = this.getRefNode(root, reference.$ref);
            if (!refText) {
                refText = this.nameProvider.getName(ref);
            }
            return {
                $refText: refText ?? '',
                ref
            };
        } else if (reference.$error) {
            const ref: Mutable<Reference> = {
                $refText: refText ?? ''
            };
            ref.error = {
                container,
                property,
                message: reference.$error,
                reference: ref
            };
            return ref;
        } else {
            return undefined;
        }
    }

    protected getRefNode<T extends AstNode>(root: AstNode, ref: CrossReference<T>): AstNode {
        if (ref[properties.referenceProperty] as string) {
            if (ref.__documentUri) {
                const doc = this.langiumDocs.getOrCreateDocument(URI.parse(ref.__documentUri));
                return this.getAstNodeById(doc.parseResult.value, ref[properties.referenceProperty] as string)!;
            }
            return this.getAstNodeById(root, ref[properties.referenceProperty] as string)!;
        } else if (ref.__path) {
            if (ref.__documentUri) {
                const doc = this.langiumDocs.getOrCreateDocument(URI.parse(ref.__documentUri));
                return this.astNodeLocator.getAstNode(doc.parseResult.value, ref.__path)!;
            }
            return this.astNodeLocator.getAstNode(root, ref.__path.substring(1))!;
        }
        return root;
    }

    private getAstNodeById<T extends AstNode = AstNode>(node: AstNode, id: string): T | undefined {
        const retNode = streamAst(node).find((astNode: any) => astNode[properties.referenceProperty] === id);
        if (retNode) return retNode as T;
        return node as T;
    }
}
