/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {boolCheckCol} from '@xh/hoist/cmp/grid';
import {RestGridModel, RestStore} from '@xh/hoist/desktop/cmp/rest';
import {ConfigDifferModel} from './differ/ConfigDifferModel';

@HoistModel
export class ConfigModel {

    @managed
    gridModel = new RestGridModel({
        stateModel: 'xhConfigGrid',
        enableColChooser: true,
        enableExport: true,
        store: new RestStore({
            url: 'rest/configAdmin',
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
                    name: 'valueType',
                    label: 'Type',
                    lookupName: 'valueTypes',
                    editable: 'onAdd',
                    required: true
                },
                {
                    name: 'value',
                    typeField: 'valueType',
                    required: true
                },
                {
                    name: 'clientVisible',
                    type: 'bool',
                    defaultValue: false,
                    required: true
                },
                {
                    name: 'note'
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
        actionWarning: {
            del: 'Are you sure you want to delete? Deleting configs can break running apps!'
        },
        unit: 'config',
        filterFields: ['name', 'value', 'groupName', 'note'],

        sortBy: 'name',
        groupBy: 'groupName',
        columns: [
            {field: 'name', width: 200},
            {field: 'valueType', headerName: 'Type', width: 80, align: 'center'},
            {field: 'value', width: 200, renderer: this.maskIfPwd, tooltip: this.maskIfPwd},
            {field: 'clientVisible', ...boolCheckCol, headerName: 'Client?', width: 75},
            {field: 'groupName', headerName: 'Group', width: 100, hidden: true},
            {field: 'note', minWidth: 60, flex: true, tooltip: true}
        ],
        editors: [
            {field: 'name'},
            {field: 'groupName'},
            {field: 'valueType'},
            {field: 'value'},
            {field: 'clientVisible'},
            {field: 'note', type: 'textarea'},
            {field: 'lastUpdated'},
            {field: 'lastUpdatedBy'}
        ]
    });

    @managed
    differModel = new ConfigDifferModel(this.gridModel);

    async loadAsync() {
        return this.gridModel.loadAsync();
    }

    maskIfPwd(value, {record}) {
        return record.valueType === 'pwd' ? '*****' : value;
    }
}
