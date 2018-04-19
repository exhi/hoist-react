/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {GridModel} from 'hoist/grid';
import {baseCol} from 'hoist/columns/Core';

/**
 * ListModel is a special implementation of GridModel, which show data in a single
 * column, using a defined component for rendering each item.
 */
export class ListModel extends GridModel {

    /**
     * @param {function} itemFactory - elemFactory for the component used to render each item.
     *                                  Will receive record via its props.
     * @param {[]} args - Arguments for GridModel
     */
    constructor({itemFactory, ...args}) {
        delete args.columns;

        const columns = [
            baseCol({
                field: 'id',
                flex: 1,
                cellRendererFramework: (
                    class extends Component {
                        render() {
                            return itemFactory({record: this.props.data});
                        }
                    }
                )
            })
        ];

        super({columns, ...args});
    }

    onGridReady() {
        this.gridApi.setHeaderHeight(0);
        super.onGridReady();
    }

}