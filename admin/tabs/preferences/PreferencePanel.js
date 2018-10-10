/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent} from '@xh/hoist/core';
import {
    restGrid,
    RestGridModel,
    RestStore,
    addAction,
    editAction,
    deleteAction
} from '@xh/hoist/desktop/cmp/rest';
import {boolCheckCol} from '@xh/hoist/columns';

const prefEditAction = {
    ...editAction,
    confirm: {
        ...deleteAction.confirm,
        message: 'Are you sure you want to edit? Editing preferences can break running apps!'
    }
};

const prefDeleteAction = {
    ...deleteAction,
    confirm: {
        ...deleteAction.confirm,
        message: 'Are you sure you want to delete? Deleting preferences can break running apps!'
    }
};

@HoistComponent
export class PreferencePanel extends Component {

    localModel = new RestGridModel({
        stateModel: 'xhPreferenceGrid',
        enableColChooser: true,
        enableExport: true,
        store: new RestStore({
            url: 'rest/preferenceAdmin',
            reloadLookupsOnLoad: true,
            fields: [
                {
                    name: 'name',
                    required: true
                },
                {
                    name: 'groupName',
                    label: 'Group',
                    lookupName: 'groupNames',
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
                    defaultValue: false,
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
        }),
        sortBy: 'name',
        groupBy: 'groupName',
        unit: 'preference',
        filterFields: ['name', 'groupName'],
        toolbarActions: [
            addAction,
            prefEditAction,
            prefDeleteAction
        ],
        contextMenuActions: [
            addAction,
            prefEditAction,
            prefDeleteAction
        ],
        formToolbarActions: [
            prefDeleteAction
        ],
        columns: [
            {field: 'local', ...boolCheckCol, width: 70},
            {field: 'name', width: 200},
            {field: 'type', width: 100},
            {field: 'defaultValue', width: 200},
            {field: 'groupName', headerName: 'Group', width: 100},
            {field: 'notes', minWidth: 200, flex: true}
        ],
        editors: [
            {field: 'name'},
            {field: 'groupName'},
            {field: 'type'},
            {field: 'defaultValue', type: 'boolSelect'},
            {field: 'local'},
            {field: 'notes', type: 'textarea'},
            {field: 'lastUpdated'},
            {field: 'lastUpdatedBy'}
        ]
    });

    render() {
        return restGrid({model: this.model});
    }

    async loadAsync() {
        return this.model.loadAsync();
    }
}