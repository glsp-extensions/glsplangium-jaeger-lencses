/********************************************************************************
 * Copyright (c) 2022-2023 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { Args, EditorContext, NavigationTarget } from '@eclipse-glsp/protocol';
import { JsonOpenerOptions, NavigationTargetProvider } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { isAstNode } from 'langium';
import { ClassDiagramModelState } from '../../model/class-diagram-model-state.js';

@injectable()
export class NodeDocumentationNavigationTargetProvider implements NavigationTargetProvider {
    targetTypeId = 'documentation';

    @inject(ClassDiagramModelState)
    protected readonly modelState: ClassDiagramModelState;

    getTargets(editorContext: EditorContext): NavigationTarget[] {
        if (editorContext.selectedElementIds.length === 1) {
            const node = this.modelState.index.findSemanticElement(editorContext.selectedElementIds[0], isAstNode);
            if (!node?.$cstNode) {
                return [];
            }

            const sourceUri = this.modelState.sourceUri;
            if (!sourceUri) {
                return [];
            }

            const args: Args = {};
            args['jsonOpenerOptions'] = new JsonOpenerOptions(node.$cstNode?.range).toJson();
            return [{ uri: sourceUri, args: args }];
        }
        return [];
    }
}