/*
* This file belongs to Hoist, an application development toolkit
* developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
*
* Copyright © 2018 Extremely Heavy Industries Inc.
*/
import {Component} from 'react';
import {button} from 'hoist/kit/blueprint';
import {hoistComponent} from 'hoist/core';
import {grid, GridModel} from 'hoist/grid';
import {UrlStore} from 'hoist/data';
import {filler, vframe} from 'hoist/layout';
import {label, toolbar, toolbarSep} from 'hoist/cmp';
import {Icon} from 'hoist/icon';

import {baseCol} from 'hoist/columns/Core';
import {nameCol} from '../../columns/Columns';

@hoistComponent()
export class EhCachePanel extends Component {

    gridModel = new GridModel({
        store: new UrlStore({
            url: 'ehCacheAdmin/listCaches',
            fields: ['name', 'heapSize', 'entries', 'status']
        }),
        columns: [
            nameCol({minWidth: 360, flex: 3}),
            baseCol({field: 'heapSize', headerName: 'Heap Size (MB)', fixedWidth: 120, align: 'right'}),
            baseCol({field: 'entries', fixedWidth: 120, align: 'right'}),
            baseCol({field: 'status', minWidth: 120, flex: 1, align: 'right'})
        ]
    });
    
    render() {
        return vframe(
            this.renderToolbar(),
            grid({model: this.gridModel})
        );
    }

    renderToolbar() {
        return toolbar({
            items: [
                button({
                    icon: Icon.sync(),
                    text: 'Clear All',
                    onClick: this.onClearAllClick
                }),
                toolbarSep(),
                button({
                    icon: Icon.sync(),
                    onClick: this.onRefreshClick
                }),
                filler(),
                this.renderCachesCount()
            ]
        });
    }

    onClearAllClick = () => {
        XH.fetchJson({
            url: 'ehCacheAdmin/clearAllCaches',
        }).then(r => {
            return this.loadAsync();
        }).catchDefault();
    }

    onRefreshClick = () => {
        return this.loadAsync();
    }

    renderCachesCount() {
        const store = this.gridModel.store;
        return label(store.count + ' caches');
    }

    async loadAsync() {
        return this.gridModel.store.loadAsync();
    }
}
