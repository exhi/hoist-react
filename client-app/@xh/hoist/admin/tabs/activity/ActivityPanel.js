/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {XH, hoistComponent} from 'hoist/core';
import {grid, GridModel} from 'hoist/grid';
import {vframe} from 'hoist/layout';
import {collapsible} from 'hoist/cmp';
import {numberRenderer} from 'hoist/format';
import {baseCol} from 'hoist/columns/Core';
import {dateTimeCol} from 'hoist/columns/DatesTimes';

import {usernameCol} from '../../columns/Columns';
import {visitsChart} from './VisitsChart';
import {VisitsModel} from './VisitsModel';

@hoistComponent()
export class ActivityPanel extends Component {

    gridModel = new GridModel({
        url: 'trackLogAdmin',
        columns: [
            baseCol({field: 'severity', width: 60}),
            dateTimeCol({field: 'dateCreated', text: 'Date Created'}),
            usernameCol(),
            baseCol({field: 'msg', text: 'Message', width: 60}),
            baseCol({field: 'category', text: 'Category', width: 100}),
            baseCol({field: 'device', text: 'Device', width: 60}),
            baseCol({field: 'browser', text: 'Browser', width: 100}),
            baseCol({field: 'data', text: 'Data', flex: 1}),
            baseCol({field: 'impersonating', text: 'Impersonating', width: 120}),
            baseCol({
                field: 'elapsed',
                text: 'Elapsed (ms)',
                width: 60,
                valueFormatter: numberRenderer({precision: 0})
            })
        ]
    });

    visitsModel = new VisitsModel();

    render() {
        return vframe(
            grid({model: this.gridModel}),
            collapsible({
                side: 'bottom',
                contentSize: 250,
                item: visitsChart({model: this.visitsModel})
            })
        );
    }

    async loadAsync() {
        return Promise.all([this.visitsModel.loadAsync(), this.gridModel.loadAsync()]);
    }
}
