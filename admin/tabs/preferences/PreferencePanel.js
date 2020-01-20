/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {hoistCmp} from '@xh/hoist/core';
import {restGrid} from '@xh/hoist/desktop/cmp/rest';
import {boolCheckCol} from '@xh/hoist/cmp/grid';
import {textArea} from '@xh/hoist/desktop/cmp/input';

export const preferencePanel = hoistCmp.factory(
    () => restGrid({model: modelSpec})
);

const modelSpec = {
    stateModel: 'xhPreferenceGrid',
    enableColChooser: true,
    enableExport: true,
    store: {
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
                required: true,
                enableCreate: true
            },
            {
                name: 'type',
                defaultValue: 'string',
                lookupName: 'types',
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
    },
    sortBy: 'name',
    groupBy: 'groupName',
    unit: 'preference',
    filterFields: ['name', 'groupName'],
    actionWarning: {
        del: 'Are you sure you want to delete? Deleting preferences can break running apps!'
    },
    columns: [
        {field: 'local', ...boolCheckCol, width: 70},
        {field: 'name', width: 200},
        {field: 'type', width: 100},
        {field: 'defaultValue', width: 200},
        {field: 'groupName', hidden: true},
        {field: 'notes', minWidth: 200, flex: true}
    ],
    editors: [
        {field: 'name'},
        {field: 'groupName'},
        {field: 'type'},
        {field: 'defaultValue'},
        {field: 'local'},
        {field: 'notes', formField: {item: textArea()}},
        {field: 'lastUpdated'},
        {field: 'lastUpdatedBy'}
    ]
};