/********************************************************************************
 * Copyright (c) 2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { CircularNodeView, RenderingContext, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { GLabeledNode } from '../../views/label.view';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class FinalNodeView extends CircularNodeView {
    override render(node: GLabeledNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node);

        const finalNode: any = (
            <g class-node={true} class-selected={node.selected} class-mouseover={node.hoverFeedback}>
                <circle r={radius} cx={radius} cy={radius} />
                <circle fill='#4E81B4' r={radius / 1.5} cx={radius} cy={radius} />
            </g>
        );
        return finalNode;
    }
}
