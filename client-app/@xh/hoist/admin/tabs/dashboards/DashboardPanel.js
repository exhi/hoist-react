/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent} from 'hoist/core';
import {baseCol} from 'hoist/columns/Core';
import {dateCol} from 'hoist/columns/DatesTimes';
import {restGrid, RestGridModel} from 'hoist/rest';

import {usernameCol} from '../../columns/Columns';

@hoistComponent()
export class DashboardPanel extends Component {

    gridModel = new RestGridModel({
        url: 'rest/dashboardAdmin',
        actionWarning: {
            edit: 'Are you sure you want to edit this user\'s dashboard?',
            del: 'Are you sure you want to delete this user\'s dashboard?'
        },
        recordSpec: {
            fields: [
                {name: 'appCode', label: 'App Code'},
                {name: 'username', label: 'User'},
                {name: 'definition', label: 'Definition', type: 'json'},
                {name: 'lastUpdated', label: 'Last Updated', type: 'date', readOnly: true, allowNull: true}
            ]
        },
        columns: [
            baseCol({field: 'appCode', width: 100}),
            usernameCol(),
            dateCol({field: 'lastUpdated'}),
            baseCol({field: 'definition', flex: 1})
        ],
        editors: [
            {field: 'appCode'},
            {field: 'username'},
            {field: 'definition'},
            {field: 'lastUpdated', type: 'displayField'}
        ]
    });

    render() {
        return restGrid({model: this.gridModel});
    }

    loadAsync() {
        return this.gridModel.loadAsync();
    }
}
