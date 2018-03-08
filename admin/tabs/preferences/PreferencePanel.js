/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent} from 'hoist/core';
import {boolCheckCol, baseCol} from 'hoist/columns/Core';
import {restGrid, RestGridModel, RestStore} from 'hoist/rest';

import {nameFlexCol} from '../../columns/Columns';

@hoistComponent()
export class PreferencePanel extends Component {

    store = new RestStore({
        url: 'rest/preferenceAdmin',
        fields: [
            {
                name: 'name',
                required: true
            },
            {
                name: 'type',
                defaultValue: 'string',
                lookupName: 'types',
                lookupStrict: true,
                editable: 'onAdd',
                required: true
            },
            {
                name: 'defaultValue',
                typeField: 'type',
                required: true
            },
            {
                name: 'notes'
            },
            {
                name: 'local',
                type: 'bool',
                required: true
            },
            {
                name: 'lastUpdated',
                type: 'date',
                editable: false
            },
            {
                name: 'lastUpdatedBy',
                editable: false
            }
        ]
    });

    gridModel = new RestGridModel({
        store: this.store,
        actionWarning: {
            edit: 'Are you sure you want to edit? Editing preferences can break running apps!',
            del: 'Are you sure you want to delete? Deleting preferences can break running apps!'
        },
        columns: [
            boolCheckCol({field: 'local', width: 60}),
            nameFlexCol(),
            baseCol({field: 'type', width: 80}),
            baseCol({field: 'defaultValue'}),
            baseCol({field: 'notes'})
        ],
        editors: [
            {field: 'name'},
            {field: 'type'},
            {field: 'defaultValue'},
            {field: 'local'},
            {field: 'notes', type: 'textarea'},
            {field: 'lastUpdated'},
            {field: 'lastUpdatedBy'}
        ]
    });

    render() {
        return restGrid({model: this.gridModel});
    }

    async loadAsync() {
        return this.store.loadAsync();
    }
}