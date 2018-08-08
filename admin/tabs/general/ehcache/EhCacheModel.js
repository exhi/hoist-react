/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {GridModel} from '@xh/hoist/desktop/cmp/grid';
import {UrlStore} from '@xh/hoist/data';
import {emptyFlexCol} from '@xh/hoist/columns';


@HoistModel()
export class EhCacheModel {

    gridModel = new GridModel({
        stateModel: 'xhEhCacheGrid',
        enableColChooser: true,
        enableExport: true,
        store: new UrlStore({
            url: 'ehCacheAdmin/listCaches',
            fields: ['name', 'heapSize', 'entries', 'status']
        }),
        sortBy: 'name',
        columns: [
            {field: 'name', width: 360},
            {field: 'heapSize', headerName: 'Heap Size (MB)', width: 130, align: 'right'},
            {field: 'entries', width: 120, align: 'right'},
            {field: 'status', width: 120, align: 'right'},
            {...emptyFlexCol}
        ]
    });

    clearAll() {
        XH.fetchJson({
            url: 'ehCacheAdmin/clearAllCaches'
        }).then(
            this.onClearCacheSuccess()
        ).catchDefault();
    }

    onClearCacheSuccess = () => {
        this.loadAsync();
        XH.toast({message: 'Caches Cleared'});
    }

    async loadAsync() {
        return this.gridModel.loadAsync();
    }

    destroy() {
        XH.safeDestroy(this.gridModel);
    }
}


