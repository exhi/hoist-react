/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/desktop/cmp/button';
import {hbox, vbox} from '@xh/hoist/cmp/layout';

import {PanelModel} from '../PanelModel';
import './Splitter.scss';

/**
 * @private
 */
@HoistComponent
export class Splitter extends Component {

    static modelClass = PanelModel;

    render() {
        const {vertical, showSplitterCollapseButton, collapsible} = this.model;

        const cmp = vertical ? hbox : vbox,
            cfg = {
                className: `xh-resizable-splitter ${vertical ? 'vertical' : 'horizontal'}`,
                item: button({
                    className: 'xh-resizable-collapser-btn',
                    icon: Icon[this.getChevron()](),
                    onClick: this.onClick,
                    omit: !showSplitterCollapseButton || !collapsible
                })
            };

        return cmp(cfg);
    }

    getChevron() {
        const {vertical, collapsed, contentFirst} = this.model,
            directions = vertical ? ['chevronUp', 'chevronDown'] : ['chevronLeft', 'chevronRight'],
            idx = (contentFirst != collapsed ? 0 : 1);

        return directions[idx];
    }

    onClick = () => {
        this.model.toggleCollapsed();
    }
}
export const splitter = elemFactory(Splitter);