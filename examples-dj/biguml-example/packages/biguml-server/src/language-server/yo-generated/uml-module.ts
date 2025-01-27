import {
    AddedSharedModelServices,
    AddedSharedServices,
    ExtendedLangiumServices,
    ExtendedServiceRegistry,
    ModelService,
    OpenTextDocumentManager,
    OpenableTextDocuments,
    SharedServices
} from 'model-service';
import {
    DefaultSharedModuleContext,
    Module,
    PartialLangiumServices,
    PartialLangiumSharedServices,
    createDefaultModule,
    createDefaultSharedModule,
    inject
} from 'langium';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { UmlGeneratedModule, UmlGeneratedSharedModule } from '../generated/module.js';
import { ClientLogger } from './uml-client-logger.js';
import { UmlCompletionProvider } from './uml-completion-provider.js';
import { UmlDocumentBuilder } from './uml-document-builder.js';
import { UmlModelFormatter } from './uml-formatter.js';
import { UmlJsonSerializer } from './uml-json-serializer.js';
import { UmlLangiumDocumentFactory } from './uml-langium-document-factory.js';
import { UmlLangiumDocuments } from './uml-langium-documents.js';
import { QualifiedNameProvider } from './uml-naming.js';
import { UmlPackageManager } from './uml-package-manager.js';
import { UmlScopeProvider } from './uml-scope-provider.js';
import { UmlScopeComputation } from './uml-scope.js';
import { UmlSerializer } from './uml-serializer.js';
import { UmlWorkspaceManager } from './uml-workspace-manager.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type UmlAddedSharedServices = {
    workspace: {
        WorkspaceManager: UmlWorkspaceManager;
        PackageManager: UmlPackageManager;
    };
    logger: {
        ClientLogger: ClientLogger;
    };
};

export const UmlSharedServices = Symbol('UmlSharedServices');
export type UmlSharedServices = SharedServices & UmlAddedSharedServices;

export const UmlSharedModule: Module<
    UmlSharedServices,
    PartialLangiumSharedServices & UmlAddedSharedServices & AddedSharedServices & AddedSharedModelServices
> = {
    ServiceRegistry: () => new ExtendedServiceRegistry(),
    workspace: {
        WorkspaceManager: services => new UmlWorkspaceManager(services),
        PackageManager: services => new UmlPackageManager(services),
        LangiumDocumentFactory: services => new UmlLangiumDocumentFactory(services),
        LangiumDocuments: services => new UmlLangiumDocuments(services),
        TextDocuments: () => new OpenableTextDocuments(TextDocument),
        TextDocumentManager: services => new OpenTextDocumentManager(services),
        DocumentBuilder: services => new UmlDocumentBuilder(services)
    },
    logger: {
        ClientLogger: services => new ClientLogger(services)
    },
    model: {
        ModelService: services => new ModelService(services)
    }
};

export interface UmlModuleContext {
    shared: UmlSharedServices;
}
export interface UmlAddedServices {
    shared: UmlSharedServices;
    references: {
        QualifiedNameProvider: QualifiedNameProvider;
    };
    serializer: {
        Serializer: UmlSerializer;
    };
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type UmlServices = ExtendedLangiumServices & UmlAddedServices;
export const UmlServices = Symbol('UmlServices');

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export function createUmlModule(context: UmlModuleContext): Module<UmlServices, PartialLangiumServices & UmlAddedServices> {
    return {
        references: {
            ScopeComputation: services => new UmlScopeComputation(services),
            ScopeProvider: services => new UmlScopeProvider(services),
            QualifiedNameProvider: services => new QualifiedNameProvider(services)
        },
        lsp: {
            CompletionProvider: services => new UmlCompletionProvider(services),
            Formatter: () => new UmlModelFormatter()
        },
        serializer: {
            Serializer: services => new UmlSerializer(services),
            JsonSerializer: services => new UmlJsonSerializer(services)
        },
        shared: () => context.shared
    };
}

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createUmlServices(context: DefaultSharedModuleContext): {
    shared: UmlSharedServices;
    Uml: UmlServices;
} {
    const shared = inject(createDefaultSharedModule(context), UmlGeneratedSharedModule, UmlSharedModule);
    const Uml = inject(createDefaultModule({ shared }), UmlGeneratedModule, createUmlModule({ shared }));
    shared.ServiceRegistry.register(Uml);
    return { shared, Uml };
}
