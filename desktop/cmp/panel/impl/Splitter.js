/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {hoistElemFactory, useModel} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/desktop/cmp/button';
import {hbox, vbox} from '@xh/hoist/cmp/layout';

import {PanelModel} from '../PanelModel';
import './Splitter.scss';

/** @private */
export const splitter = hoistElemFactory(() => {
    const model = useModel(PanelModel),
        {vertical, showSplitterCollapseButton, collapsible} = model;

    const cmp = vertical ? hbox : vbox,
        cfg = {
            className: `xh-resizable-splitter ${vertical ? 'vertical' : 'horizontal'}`,
            item: button({
                className: 'xh-resizable-collapser-btn',
                icon: Icon[getChevron(model)](),
                onClick: () => model.toggleCollapsed(),
                omit: !showSplitterCollapseButton || !collapsible
            })
        };

    return cmp(cfg);
});

function getChevron(model) {
    const {vertical, collapsed, contentFirst} = model,
        directions = vertical ? ['chevronUp', 'chevronDown'] : ['chevronLeft', 'chevronRight'],
        idx = (contentFirst != collapsed ? 0 : 1);
    return directions[idx];
}