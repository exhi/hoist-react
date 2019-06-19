/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel, managed, LoadSupport} from '@xh/hoist/core';
import {GridModel} from '@xh/hoist/cmp/grid';
import {UrlStore} from '@xh/hoist/data';
import {emptyFlexCol, numberCol} from '@xh/hoist/cmp/grid';
import {trimEnd} from 'lodash';

@HoistModel
@LoadSupport
export class EhCacheModel {

    @managed
    gridModel = new GridModel({
        stateModel: 'xhEhCacheGrid',
        enableColChooser: true,
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
            {field: 'status', width: 120},
            {...emptyFlexCol}
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
        return this.gridModel.loadAsync(loadSpec);
    }
}


