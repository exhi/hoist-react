/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent} from 'hoist/core';
import {grid, GridModel} from 'hoist/grid';
import {UrlStore} from 'hoist/data';
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

    store = new UrlStore({
        url: 'trackLogAdmin',
        fields: [
            'severity', 'dateCreated', 'msg', 'category', 'device',
            'browser', 'data', 'impersonating', 'elapsed'
        ]
    });

    gridModel = new GridModel({
        store: this.store,
        columns: [
            baseCol({field: 'severity', width: 60}),
            dateTimeCol({field: 'dateCreated'}),
            usernameCol(),
            baseCol({field: 'msg', headerName: 'Message', width: 60}),
            baseCol({field: 'category', width: 100}),
            baseCol({field: 'device', width: 60}),
            baseCol({field: 'browser', width: 100}),
            baseCol({field: 'data'}),
            baseCol({field: 'impersonating',  width: 120}),
            baseCol({
                field: 'elapsed',
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
        return Promise.all([this.visitsModel.loadAsync(), this.store.loadAsync()]);
    }
}
