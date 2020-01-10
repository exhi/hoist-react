/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {tabContainer} from '@xh/hoist/cmp/tab';
import {hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';

import {LogLevelPanel} from './LogLevelPanel';
import {LogViewer} from './viewer/LogViewer';

export const LoggingTab = hoistCmp(
    () => tabContainer({
        model: {
            route: 'default.logging',
            switcherPosition: 'left',
            tabs: [
                {id: 'viewer', icon: Icon.fileText(), content: LogViewer},
                {id: 'config', icon: Icon.settings(), content: LogLevelPanel}
            ]
        }
    })
);
