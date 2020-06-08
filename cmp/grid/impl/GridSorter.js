/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {Utils as agUtils} from '@ag-grid-community/all-modules';
import {isNumber, isString} from 'lodash';

export class GridSorter {

    colId;
    sort;
    abs;

    /**
     * Create a new GridSorter. Accepts a GridSorter configuration or a pipe delimited string
     * generated using GridSorter.toString().
     *
     * @param {Object|String} [cfg] - GridSorter configuration or string representation.
     */
    static parse(cfg) {
        if (isString(cfg)) {
            const [colId, sort, abs] = cfg.split('|');
            cfg = {colId, sort, abs};
        }
        return new GridSorter(cfg);
    }

    /**
     * @param {Object} c - GridSorter configuration.
     * @param {string} c.colId - Column ID on which to sort.
     * @param {string} c.sort - direction of sort. Either 'asc' or 'desc'.
     * @param {boolean} [c.abs] - true to sort by absolute value.
     */
    constructor({
        colId,
        sort = 'asc',
        abs = false
    }) {
        this.colId = colId;
        this.sort = isString(sort) ? sort.toLowerCase() : null;
        this.abs = !!abs;
    }

    /**
     * Generate a delimited string representation suitable for consumption by parse().
     * @returns {string}
     */
    toString() {
        return [
            this.colId,
            this.sort,
            this.abs ? 'abs' : null
        ].filter(Boolean).join('|');
    }

    comparator(v1, v2) {
        if (this.abs) {
            v1 = isNumber(v1) ? Math.abs(v1) : v1;
            v2 = isNumber(v2) ? Math.abs(v2) : v2;
        }
        return agUtils.defaultComparator(v1, v2);
    }

}