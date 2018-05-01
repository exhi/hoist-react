/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {grid} from 'hoist/grid';
import {GridModel} from 'hoist/grid';
import {baseCol} from 'hoist/columns/Core';

@hoistComponent()
class DataView extends Component {

    constructor(props) {
        super();
        const {store, selection, contextMenuFn, itemFactory} = props.model;
        this._gridModel = new GridModel({
            store,
            selection,
            contextMenuFn,
            columns: [
                baseCol({
                    field: 'id',
                    flex: 1,
                    autoHeight: true,
                    renderElement: (props) => {
                        return itemFactory({record: props.data});
                    }
                })
            ]
        });
    }

    render() {
        const {rowCls} = this.props;
        return grid({
            model: this._gridModel,
            gridOptions: {
                headerHeight: 0,
                rowClass: rowCls
            }
        });
    }

}

export const dataView = elemFactory(DataView);