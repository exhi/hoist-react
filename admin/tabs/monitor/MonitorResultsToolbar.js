/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {hbox, filler} from '@xh/hoist/cmp/layout';
import {label} from '@xh/hoist/desktop/cmp/form';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';
import {relativeTimestamp} from '@xh/hoist/cmp/relativetimestamp';
import {Icon} from '@xh/hoist/icon';

/**
 * @private
 */
@HoistComponent()
export class MonitorResultsToolbar extends Component {
    render() {
        const {passed, warned, failed, forceRunAllMonitors, lastRun} = this.model;

        return toolbar({
            items: [
                button({
                    icon: Icon.refresh(),
                    text: 'Run all now',
                    onClick: forceRunAllMonitors
                }),
                hbox({
                    className: !failed ? 'hidden' : '',
                    items: [
                        Icon.error({prefix: 'fas', className: 'xh-red'}),
                        label(`${failed} failed`)
                    ]
                }),
                hbox({
                    className: !warned ? 'hidden' : '',
                    items: [
                        Icon.warning({prefix: 'fas', className: 'xh-orange'}),
                        label(`${warned} warned`)
                    ]
                }),
                hbox({
                    className: !passed ? 'hidden' : '',
                    items: [
                        Icon.checkCircle({prefix: 'fas', className: 'xh-green'}),
                        label(`${passed} passed`)
                    ]
                }),
                filler(),
                relativeTimestamp({timestamp: lastRun, options: {emptyResult: 'No results available!'}})
            ]
        });
    }
}

export const monitorResultsToolbar = elemFactory(MonitorResultsToolbar);