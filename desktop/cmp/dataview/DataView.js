/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, HoistComponent, elemFactory, LayoutSupport} from '@xh/hoist/core';
import {grid} from '@xh/hoist/desktop/cmp/grid';
import {GridModel} from '@xh/hoist/desktop/cmp/grid';

@HoistComponent()
@LayoutSupport
export class DataView extends Component {

    baseClassName = 'xh-data-view';

    constructor(props) {
        super(props);
        const {store, selModel, contextMenuFn, itemFactory, emptyText} = props.model;
        this._gridModel = new GridModel({
            store,
            selModel,
            contextMenuFn,
            emptyText,
            columns: [
                {
                    colId: 'data',
                    flex: true,
                    elementRenderer: (record) => itemFactory({record: record.data}),
                    agOptions: {
                        valueGetter: (params) => params.data
                    }
                }
            ]
        });
    }

    render() {
        const {rowCls, itemHeight} = this.props;
        return grid({
            ...this.getLayoutProps(),
            className: this.getClassName(),
            model: this._gridModel,
            agOptions: {
                headerHeight: 0,
                rowClass: rowCls,
                rowHeight: itemHeight
            }
        });
    }

    destroy() {
        XH.safeDestroy(this._gridModel);
    }
}

export const dataView = elemFactory(DataView);