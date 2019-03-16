/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistComponent, useProvidedModel} from '@xh/hoist/core';
import {box, hbox, vbox, filler} from '@xh/hoist/cmp/layout';
import {headerCollapseButton} from './HeaderCollapseButton';

import './PanelHeader.scss';
import {PanelModel} from '../PanelModel';

/**
 * A standardized header for a Panel component
 * @private
 */
export const [PanelHeader, panelHeader] = hoistComponent({
    render(props) {

        const model = useProvidedModel(PanelModel, props),
            {title, icon, headerItems = []} = props,
            {collapsed, vertical, side, showHeaderCollapseButton} = model || {};

        if (!title && !icon && !headerItems.length && !showHeaderCollapseButton) return null;

        const onDoubleClick = () => {
            if (model && model.collapsible) model.toggleCollapsed();
        };

        if (!collapsed || vertical) {
            return hbox({
                className: 'xh-panel-header',
                items: [
                    icon || null,
                    title ?
                        box({
                            className: 'xh-panel-header-title',
                            flex: 1,
                            item: title
                        }) :
                        filler(),
                    ...(!collapsed ? headerItems : []),
                    renderHeaderCollapseButton(model)
                ],
                onDoubleClick
            });
        } else {
            // For Compressed vertical layout, skip header items.
            const isLeft = side === 'left';
            return vbox({
                className: `xh-panel-header xh-panel-header-${side}`,
                flex: 1,
                items: [
                    isLeft ? filler() : renderHeaderCollapseButton(model),
                    icon || null,
                    title ?
                        box({
                            className: 'xh-panel-header-title',
                            item: title
                        }) :
                        null,
                    !isLeft ? filler() : renderHeaderCollapseButton(model)
                ],
                onDoubleClick
            });
        }
    }
});

//---------------------
// Implementation
//---------------------
function renderHeaderCollapseButton(model) {
    if (!model) return null;

    return model.showHeaderCollapseButton && model.collapsible ?
        headerCollapseButton({model}) :
        null;
}
