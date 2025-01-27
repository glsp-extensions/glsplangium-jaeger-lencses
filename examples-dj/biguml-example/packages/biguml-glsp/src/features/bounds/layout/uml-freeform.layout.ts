/*********************************************************************************
 * Copyright (c) 2023 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 *********************************************************************************/
import { GParentElement, isSizeable, LayoutContainer, StatefulLayouter } from '@eclipse-glsp/client';
import { FreeFormLayouter } from '@eclipse-glsp/client/lib/features/bounds/freeform-layout';
import { Dimension } from '@eclipse-glsp/protocol';
import { injectable } from 'inversify';
import { AbstractLayoutOptions } from 'sprotty/lib/features/bounds/layout-options';

@injectable()
export class UmlFreeFormLayouter extends FreeFormLayouter {
    static override KIND = 'uml-freeform';

    // Only sizeable children will be returned
    protected override getChildrenSize(
        container: GParentElement & LayoutContainer,
        containerOptions: AbstractLayoutOptions,
        layouter: StatefulLayouter
    ): Dimension {
        let maxX = 0;
        let maxY = 0;
        container.children
            .filter(child => isSizeable(child))
            .forEach(child => {
                const bounds = layouter.getBoundsData(child).bounds;
                if (bounds !== undefined && Dimension.isValid(bounds)) {
                    const childMaxX = bounds.x + bounds.width;
                    const childMaxY = bounds.y + bounds.height;
                    maxX = Math.max(maxX, childMaxX);
                    maxY = Math.max(maxY, childMaxY);
                }
            });
        return {
            width: maxX,
            height: maxY
        };
    }
}
