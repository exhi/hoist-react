/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {hbox} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {tile} from './Tile';

export const monitorResultsDisplay = hoistCmp.factory(
    ({model}) => hbox({
        className: 'xh-monitor-status-display',
        items: model.results.map((check, idx) => tile({
            key: `tile-${idx}`,
            check
        }))
    })
);
