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
import { CreateNodeOperation } from '@eclipse-glsp/server';
import { createRandomUUID } from 'model-service';
import { injectable } from 'inversify';
import { Class } from '../../../../../language-server/generated/ast.js';
import { findAvailableNodeName } from '../../../../../language-server/yo-generated/util/name-util.js';
import { ModelTypes } from '../../util/model-types.js';
import { CreateContainerOperationHandler } from './create-container-operation-handler.js';

@injectable()
export abstract class CreateClassDiagramNodeOperationHandler extends CreateContainerOperationHandler {
    override readonly operationType = CreateNodeOperation.KIND;

    override elementTypeIds = [ModelTypes.CLASS, ModelTypes.ABSTRACT_CLASS];

    override label = 'Class';

    createClass(operation: CreateNodeOperation, isAbstract: boolean): string {
        const newName = findAvailableNodeName(this.modelState.semanticRoot, 'NewClass');
        const newClass: Class = {
            $type: 'Class',
            $container: null,
            __id: operation.args?.__id ? operation.args.__id.toString() : createRandomUUID(),
            name: newName,
            isAbstract: isAbstract,
            properties: [],
            operations: [],
            visibility: 'PUBLIC',
            isActive: true
        };
        this.insertEntityToSemanticText(operation, newClass);
        return newClass.__id;
    }
}
