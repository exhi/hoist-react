/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {
    addAction,
    cloneAction,
    deleteAction,
    editAction,
    RestGridModel
} from '@xh/hoist/desktop/cmp/rest';
import {boolCheckCol, dateTimeCol} from '@xh/hoist/cmp/grid';
import {fmtDateTime} from '@xh/hoist/format';
import {textArea} from '@xh/hoist/desktop/cmp/input';
import {isDate, truncate} from 'lodash';

import {DifferModel} from '../../differ/DifferModel';

export class JsonBlobModel extends HoistModel {

    persistWith = {localStorageKey: 'xhAdminJsonBlobState'};

    @managed
    gridModel = new RestGridModel({
        persistWith: this.persistWith,
        colChooserModel: true,
        enableExport: true,
        selModel: 'multiple',
        store: {
            url: 'rest/jsonBlobAdmin',
            reloadLookupsOnLoad: true,
            fieldDefaults: {disableXssProtection: true},
            fields: [
                {
                    name: 'token',
                    editable: false
                },
                {
                    name: 'owner'
                },
                {
                    name: 'acl',
                    displayName: 'ACL'
                },
                {
                    name: 'name',
                    required: true
                },
                {
                    name: 'type',
                    lookupName: 'types',
                    required: true,
                    enableCreate: true
                },
                {
                    name: 'value',
                    type: 'json',
                    required: true
                },
                {
                    name: 'meta',
                    type: 'json'
                },
                {
                    name: 'description'
                },
                {
                    name: 'archived',
                    type: 'bool',
                    defaultValue: false,
                    required: true
                },
                {
                    name: 'archivedDate',
                    type: 'date',
                    editable: false
                },
                {
                    name: 'dateCreated',
                    type: 'date',
                    editable: false
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
        toolbarActions: [
            addAction,
            editAction,
            cloneAction,
            deleteAction
        ],
        menuActions: [
            addAction,
            editAction,
            cloneAction,
            deleteAction
        ],
        prepareCloneFn: ({clone}) => clone.name = `${clone.name}_CLONE`,
        sortBy: ['owner', 'name'],
        groupBy: 'type',
        unit: 'blob',
        filterFields: ['name', 'owner', 'type', 'value', 'meta', 'description'],
        columns: [
            {field: 'token', width: 100, hidden: true},
            {field: 'archived', ...boolCheckCol, width: 100},
            {field: 'owner', width: 200},
            {field: 'acl', width: 80},
            {field: 'name', width: 200},
            {field: 'type', width: 200},
            {field: 'description', width: 200},
            {field: 'value', flex: 1, renderer: this.valueRenderer},
            {field: 'meta', width: 200},
            {field: 'archivedDate', ...dateTimeCol, renderer: this.archivedDateRenderer, hidden: true},
            {field: 'dateCreated', ...dateTimeCol, hidden: true},
            {field: 'lastUpdated', ...dateTimeCol, hidden: true},
            {field: 'lastUpdatedBy', width: 160, hidden: true}
        ],
        editors: [
            {field: 'token'},
            {field: 'owner'},
            {field: 'acl'},
            {field: 'name'},
            {field: 'type'},
            {field: 'description', formField: {item: textArea()}},
            {field: 'value'},
            {field: 'meta'},
            {field: 'archived'},
            {field: 'archivedDate', formField: {readonlyRenderer: v => {
                return (!isDate(v) || v.getTime() === 0) ? '-' : fmtDateTime(v);
            }}},
            {field: 'dateCreated'},
            {field: 'lastUpdated'},
            {field: 'lastUpdatedBy'}
        ]
    });

    @managed
    differModel = new DifferModel({
        parentGridModel: this.gridModel,
        entityName: 'jsonBlob',
        displayName: 'json blob',
        columnFields: ['name', 'owner', 'type', {field: 'archivedDate', ...dateTimeCol, renderer: this.archivedDateRenderer}],
        matchFields: ['name', 'owner', 'type', 'archivedDate']
    });

    async doLoadAsync(loadSpec) {
        return this.gridModel.loadAsync(loadSpec).catchDefault();
    }

    valueRenderer(v) {
        return truncate(v, {length: 500});
    }

    archivedDateRenderer(v) {
        return v > 0 ? fmtDateTime(v) : '-';
    }

}
