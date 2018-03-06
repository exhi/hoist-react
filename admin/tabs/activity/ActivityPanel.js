/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent} from 'hoist/core';
import {grid} from 'hoist/grid';
import {vframe} from 'hoist/layout';
import {collapsible} from 'hoist/cmp';

import {activityGridToolbar} from './ActivityGridToolbar';
import {ActivityGridModel} from './ActivityGridModel';
import {visitsChart} from './VisitsChart';
import {VisitsChartModel} from './VisitsChartModel';

@hoistComponent()
export class ActivityPanel extends Component {

    activityGridModel = new ActivityGridModel();
    visitsChartModel = new VisitsChartModel();

    render() {
        return vframe(
            activityGridToolbar({model: this.activityGridModel}),
            grid({model: this.activityGridModel.gridModel}),
            collapsible({
                side: 'bottom',
                contentSize: 250,
                item: visitsChart({model: this.visitsChartModel})
            })
        ) ;
    }

    async loadAsync() {
        return Promise.all([this.visitsChartModel.loadAsync(), this.activityGridModel.loadAsync()]);
    }
}
