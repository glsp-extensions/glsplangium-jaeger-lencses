/*********************************************************************************
 * Copyright (c) 2023 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { UmlDiagramType } from '@biguml/biguml-protocol';
import { ContainerModule } from 'inversify';
import {
    registerAbstractionElement,
    registerClassElement,
    registerDependencyElement,
    registerElementImportElement,
    registerPackageElement,
    registerPackageImportElement,
    registerPackageMergeElement
} from '../../elements/index';

export const umlPackageDiagramModule = new ContainerModule((bind, undbind, isBound, rebind) => {
    const context = { bind, undbind, isBound, rebind };

    registerClassElement(context, UmlDiagramType.PACKAGE);
    registerPackageElement(context, UmlDiagramType.PACKAGE);

    registerAbstractionElement(context, UmlDiagramType.PACKAGE);
    registerDependencyElement(context, UmlDiagramType.PACKAGE);
    registerElementImportElement(context, UmlDiagramType.PACKAGE);
    registerPackageImportElement(context, UmlDiagramType.PACKAGE);
    registerPackageMergeElement(context, UmlDiagramType.PACKAGE);
});