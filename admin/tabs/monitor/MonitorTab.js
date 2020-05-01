/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {tabContainer} from '@xh/hoist/cmp/tab';
import {hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {monitorEditorPanel} from './MonitorEditorPanel';
import {monitorResultsPanel} from './MonitorResultsPanel';

export const monitorTab = hoistCmp.factory(
    () => tabContainer({
        model: {
            route: 'default.monitor',
            switcherPosition: 'left',
            tabs: [
                {id: 'status', icon: Icon.shieldCheck(), content: monitorResultsPanel},
                {id: 'config', icon: Icon.settings(), content: monitorEditorPanel}
            ]
        }
    })
);
