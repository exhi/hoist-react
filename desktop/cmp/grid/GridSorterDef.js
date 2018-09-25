/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Utils} from 'ag-grid';

/**
 * Basic Model for a grid sorter definition.
 */
export class GridSorterDef {

    colId;
    sort;
    abs;

    /**
     * @param {Object} c - GridSorterDef configuration.
     * @param {string} c.colId - colId for the column.
     * @param {string} c.sort - direction of sort. Either 'asc' or 'desc'.
     * @param {boolean} [c.abs] - true to sort this column by absolute value.
     */
    constructor({
        colId,
        sort,
        abs = false
    }) {
        this.colId = colId;
        this.sort = sort;
        this.abs = abs;
    }

    comparator(v1, v2) {
        if (this.abs) {
            return Math.abs(v1) - Math.abs(v2);
        } else {
            return Utils.defaultComparator(v1, v2);
        }
    }

}