/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, HoistComponent, elemFactory, LayoutSupport} from '@xh/hoist/core';
import {grid, GridModel} from '@xh/hoist/cmp/grid';
import {omit} from 'lodash';

/**
 * A DataView is a specialized version of the Grid component. It displays its data within a
 * single column, using a configured component for rendering each item.
 *
 * @see DataViewModel
 */
@HoistComponent
@LayoutSupport
export class DataView extends Component {

    baseClassName = 'xh-data-view';

    constructor(props) {
        super(props);
        const {store, selModel, contextMenuFn, itemRenderer, emptyText} = props.model;
        this._gridModel = new GridModel({
            store,
            selModel,
            contextMenuFn,
            emptyText,
            columns: [
                {
                    colId: 'data',
                    flex: true,
                    elementRenderer: itemRenderer,
                    agOptions: {
                        valueGetter: this.valueGetter
                    }
                }
            ]
        });
    }

    render() {
        const {rowCls, itemHeight, onRowDoubleClicked} = this.props;
        return grid({
            ...this.getLayoutProps(),
            className: this.getClassName(),
            model: this._gridModel,
            agOptions: {
                headerHeight: 0,
                rowClass: rowCls,
                getRowHeight: () => itemHeight
            },
            onRowDoubleClicked: onRowDoubleClicked
        });
    }

    valueGetter = (params) => {
        const realData = omit(params.data.raw, 'id');
        return Object.values(realData).join('\r');
    }

    destroy() {
        XH.safeDestroy(this._gridModel);
    }
}

export const dataView = elemFactory(DataView);