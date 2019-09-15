/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistCmpFactory} from '@xh/hoist/core';
import {box, hbox, vbox, filler} from '@xh/hoist/cmp/layout';
import {getClassName} from '@xh/hoist/utils/react';

import './PanelHeader.scss';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

export const panelHeader = hoistCmpFactory({
    displayName: 'PanelHeader',
    model: false,

    render({model, ...props}) {
        const {collapsed, vertical, side, showHeaderCollapseButton} = model,
            {title, icon, compact, headerItems = []} = props;

        if (!title && !icon && !headerItems.length && !showHeaderCollapseButton) return null;

        const onDoubleClick = () => {
            if (model.collapsible) model.toggleCollapsed();
        };

        const baseCls = 'xh-panel-header',
            titleCls = 'xh-panel-header__title',
            sideCls = `xh-panel-header--${side}`,
            compactCls = compact ? 'xh-panel-header--compact' : null;

        if (!collapsed || vertical) {
            return hbox({
                className: getClassName(baseCls, props, compactCls),
                items: [
                    icon || null,
                    title ?
                        box({
                            className: titleCls,
                            flex: 1,
                            item: title
                        }) :
                        filler(),
                    ...(!collapsed ? headerItems : []),
                    collapseButton({model})
                ],
                onDoubleClick
            });
        } else {
            // For vertical layout, skip header items.
            const isLeft = side === 'left';
            return vbox({
                className: getClassName(baseCls, props, sideCls, compactCls),
                flex: 1,
                items: [
                    isLeft ? filler() : collapseButton({model}),
                    icon || null,
                    title ?
                        box({
                            className: titleCls,
                            item: title
                        }) :
                        null,
                    !isLeft ? filler() : collapseButton({model})
                ],
                onDoubleClick
            });
        }
    }
});


const collapseButton = hoistCmpFactory({
    displayName: 'CollapseButton',
    model: false,

    render({model}) {
        if (!model.showHeaderCollapseButton || !model.collapsible) return null;

        const {vertical, collapsed, contentFirst} = model,
            directions = vertical ? ['chevronUp', 'chevronDown'] : ['chevronLeft', 'chevronRight'],
            idx = (contentFirst != collapsed ? 0 : 1),
            chevron = directions[idx];

        return button({
            icon: Icon[chevron](),
            onClick: () => model.toggleCollapsed(),
            minimal: true
        });
    }
});