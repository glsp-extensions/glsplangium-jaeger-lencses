/******************************************************************************
 * This file was generated by langium-cli 2.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import type { AstNode, Reference, ReferenceInfo, TypeMetaData } from 'langium';
import { AbstractAstReflection } from 'langium';

export const WorkflowDiagramTerminals = {
    WS: /\s+/,
    LANGIUM_INT: /(-)?[0-9]+(\.[0-9]*)?/,
    LANGIUM_ID: /[\w_-]+/,
    ML_COMMENT: /\/\*[\s\S]*?\*\//,
    SL_COMMENT: /\/\/[^\n\r]*/,
};

export type MetaInfo = Position | Size;

export const MetaInfo = 'MetaInfo';

export function isMetaInfo(item: unknown): item is MetaInfo {
    return reflection.isInstance(item, MetaInfo);
}

export type Node = ActivityNode | Category | TaskNode;

export const Node = 'Node';

export function isNode(item: unknown): item is Node {
    return reflection.isInstance(item, Node);
}

export type NodeType = 'decision' | 'fork' | 'join' | 'merge';

export function isNodeType(item: unknown): item is NodeType {
    return item === 'decision' || item === 'fork' || item === 'join' || item === 'merge';
}

export type TaskType = 'automated' | 'manual';

export function isTaskType(item: unknown): item is TaskType {
    return item === 'manual' || item === 'automated';
}

export type Weight = 'high' | 'low' | 'medium';

export function isWeight(item: unknown): item is Weight {
    return item === 'low' || item === 'medium' || item === 'high';
}

export interface ActivityNode extends AstNode {
    readonly $container: Model;
    readonly $type: 'ActivityNode';
    __id: string
    name: string
    nodeType?: NodeType
}

export const ActivityNode = 'ActivityNode';

export function isActivityNode(item: unknown): item is ActivityNode {
    return reflection.isInstance(item, ActivityNode);
}

export interface Category extends AstNode {
    readonly $container: Model;
    readonly $type: 'Category';
    __id: string
    children?: Model
    label?: string
    name: string
}

export const Category = 'Category';

export function isCategory(item: unknown): item is Category {
    return reflection.isInstance(item, Category);
}

export interface Edge extends AstNode {
    readonly $type: 'Edge' | 'WeightedEdge';
    __id: string
    source: Reference<Node>
    target: Reference<Node>
}

export const Edge = 'Edge';

export function isEdge(item: unknown): item is Edge {
    return reflection.isInstance(item, Edge);
}

export interface Model extends AstNode {
    readonly $container: Category;
    readonly $type: 'Model';
    edges: Array<Edge>
    metaInfos: Array<MetaInfo>
    nodes: Array<Node>
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface Position extends AstNode {
    readonly $container: Model;
    readonly $type: 'Position';
    __id: string
    node: Reference<Node>
    x: number
    y: number
}

export const Position = 'Position';

export function isPosition(item: unknown): item is Position {
    return reflection.isInstance(item, Position);
}

export interface Size extends AstNode {
    readonly $container: Model;
    readonly $type: 'Size';
    __id: string
    height: number
    node: Reference<Node>
    width: number
}

export const Size = 'Size';

export function isSize(item: unknown): item is Size {
    return reflection.isInstance(item, Size);
}

export interface TaskNode extends AstNode {
    readonly $container: Model;
    readonly $type: 'TaskNode';
    __id: string
    duration?: number
    label?: string
    name: string
    reference?: string
    taskType?: TaskType
}

export const TaskNode = 'TaskNode';

export function isTaskNode(item: unknown): item is TaskNode {
    return reflection.isInstance(item, TaskNode);
}

export interface WeightedEdge extends Edge {
    readonly $type: 'WeightedEdge';
    __id: string
    source: Reference<Node>
    target: Reference<Node>
    weight: Weight
}

export const WeightedEdge = 'WeightedEdge';

export function isWeightedEdge(item: unknown): item is WeightedEdge {
    return reflection.isInstance(item, WeightedEdge);
}

export type WorkflowDiagramAstType = {
    ActivityNode: ActivityNode
    Category: Category
    Edge: Edge
    MetaInfo: MetaInfo
    Model: Model
    Node: Node
    Position: Position
    Size: Size
    TaskNode: TaskNode
    WeightedEdge: WeightedEdge
}

export class WorkflowDiagramAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return ['ActivityNode', 'Category', 'Edge', 'MetaInfo', 'Model', 'Node', 'Position', 'Size', 'TaskNode', 'WeightedEdge'];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case ActivityNode:
            case Category:
            case TaskNode: {
                return this.isSubtype(Node, supertype);
            }
            case Position:
            case Size: {
                return this.isSubtype(MetaInfo, supertype);
            }
            case WeightedEdge: {
                return this.isSubtype(Edge, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Edge:source':
            case 'Edge:target':
            case 'Position:node':
            case 'Size:node':
            case 'WeightedEdge:source':
            case 'WeightedEdge:target':
            case 'WeightedEdge:source':
            case 'WeightedEdge:target': {
                return Node;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'Model': {
                return {
                    name: 'Model',
                    mandatory: [
                        { name: 'edges', type: 'array' },
                        { name: 'metaInfos', type: 'array' },
                        { name: 'nodes', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}

export const reflection = new WorkflowDiagramAstReflection();
