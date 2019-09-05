/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistElemFactory, useModel} from '@xh/hoist/core';
import {hbox} from '@xh/hoist/cmp/layout';
import {tile} from './Tile';
import {MonitorResultsModel} from './MonitorResultsModel';

export const monitorResultsDisplay = hoistElemFactory(() => {
    const model = useModel(MonitorResultsModel);
    return hbox({
        className: 'xh-monitor-status-display',
        items: model.results.map((check, idx) => tile({
            key: `tile-${idx}`,
            check
        }))
    });
});