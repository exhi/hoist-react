/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {hoistCmp} from '@xh/hoist/core';
import {restGrid} from '@xh/hoist/desktop/cmp/rest';
import {usernameCol} from '@xh/hoist/admin/columns';

export const userPreferencePanel = hoistCmp.factory(
    () => restGrid({model: modelSpec})
);

const modelSpec = {
    stateModel: 'xhUserPreferenceGrid',
    enableColChooser: true,
    enableExport: true,
    store: {
        url: 'rest/userPreferenceAdmin',
        reloadLookupsOnLoad: true,
        fields: [
            {
                name: 'name',
                label: 'Pref',
                lookupName: 'names',
                editable: 'onAdd',
                required: true
            },
            {
                name: 'groupName',
                label: 'Group',
                lookupName: 'groupNames',
                editable: false
            },
            {
                name: 'type',
                editable: false
            },
            {
                name: 'username',
                label: 'User',
                required: true
            },
            {
                name: 'userValue',
                typeField: 'type',
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
    filterFields: ['name', 'username'],
    columns: [
        {field: 'name', width: 200},
        {field: 'type', width: 100},
        {field: 'username', ...usernameCol},
        {field: 'groupName', hidden: true},
        {field: 'userValue', minWidth: 200, flex: true}
    ],
    editors: [
        {field: 'name'},
        {field: 'username'},
        {field: 'userValue'},
        {field: 'lastUpdated'},
        {field: 'lastUpdatedBy'}
    ]
};