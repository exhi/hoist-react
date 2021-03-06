/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {GridModel, numberCol} from '@xh/hoist/cmp/grid';
import {HoistModel, managed, XH} from '@xh/hoist/core';
import {UrlStore} from '@xh/hoist/data';
import {trimEnd} from 'lodash';

export class EhCacheModel extends HoistModel {

    persistWith = {localStorageKey: 'xhAdminEhCacheState'};

    @managed
    gridModel = new GridModel({
        persistWith: this.persistWith,
        colChooserModel: true,
        enableExport: true,
        store: new UrlStore({
            url: 'ehCacheAdmin/listCaches',
            fields: ['name', 'heapSize', 'entries', 'status'],
            idSpec: 'name',
            processRawData: row => {
                return {
                    ...row,
                    heapSize: parseFloat(trimEnd(row.heapSize, 'MB'))
                };
            }
        }),
        sortBy: 'name',
        columns: [
            {field: 'name', width: 360},
            {field: 'heapSize', ...numberCol, headerName: 'Heap Size (MB)', width: 130},
            {field: 'entries', ...numberCol, width: 120},
            {field: 'status', width: 120}
        ]
    });

    clearAll() {
        XH.fetchJson({
            url: 'ehCacheAdmin/clearAllCaches'
        }).then(() => {
            this.loadAsync();
            XH.toast({message: 'Caches Cleared'});
        }).catchDefault();
    }

    async doLoadAsync(loadSpec) {
        return this.gridModel.loadAsync(loadSpec).catchDefault();
    }
}


