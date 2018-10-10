/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {HoistModel} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {Column} from '@xh/hoist/columns';
import {throwIf, warnIf} from '@xh/hoist/utils/js';
import {castArray, isEmpty, uniq} from 'lodash';

// Todo: Move to cross platform cmp package
import {GridSorter} from '@xh/hoist/desktop/cmp/grid/GridSorter';

/**
 * Core Model for a Grid, specifying the grid's data store, column definitions and sorting state.
 *
 * This is the primary application entry-point for specifying Grid component options and behavior.
 */
@HoistModel
export class GridModel {

    //------------------------
    // Immutable public properties
    //------------------------
    /** @member {BaseStore} */
    store = null;
    /** @member {function} */
    rowClassFn = null;

    //------------------------
    // Observable API
    //------------------------
    /** @member {Column[]} */
    @observable.ref columns = [];
    /** @member {GridSorterDef[]} */
    @observable.ref sortBy = [];
    /** @member {boolean} */
    @observable compact = false;
    /** @member {GridApi} */
    @observable.ref agApi = null;

    /**
     * @param {Object} c - GridModel configuration.
     * @param {BaseStore} c.store - store containing the data for the grid.
     * @param {(Column[]|Object[])} c.columns - Columns, or configs to create them.
     * @param {?string} [c.emptyText] - text/HTML to display if grid has no records.
     *      Defaults to null, in which case no empty text will be shown.
     * @param {(string|string[]|GridSorterDef|GridSorterDef[])} [c.sortBy] - colId(s) or sorter
     *      config(s) with colId and sort direction.
     * @param {boolean} [c.compact] - true to render the grid in compact mode.
     * @param {function} [c.rowClassFn] - closure to generate css class names for a row.
     *      Should return a string or array of strings. Receives record data as param.
     */
    constructor({
        store,
        columns,
        emptyText = null,
        sortBy = [],
        compact = false,
        rowClassFn = null
    }) {
        this.store = store;
        this.emptyText = emptyText;
        this.rowClassFn = rowClassFn;

        this.setColumns(columns);
        this.setSortBy(sortBy);
        this.setCompact(compact);
    }

    /** Does the grid have any records to show? */
    get empty() {
        return this.store.empty;
    }

    @action
    setAgApi(agApi) {
        this.agApi = agApi;
    }

    /**
     * This method is no-op if provided any sorters without a corresponding column.
     * @param {(string|string[]|Object|Object[])} sorters - colId(s), GridSorter config(s)
     *      or GridSorter strings.
     */
    @action
    setSortBy(sorters) {
        // Normalize string, and partially specified values
        sorters = castArray(sorters);
        sorters = sorters.map(it => {
            if (it instanceof GridSorter) return it;
            return GridSorter.parse(it);
        });

        const invalidSorters = sorters.filter(it => !this.findColumn(this.columns, it.colId));
        if (invalidSorters.length) {
            console.warn('GridSorter colId not found in grid columns', invalidSorters);
            return;
        }

        this.sortBy = sorters;
    }

    @action
    setCompact(compact) {
        this.compact = compact;
    }

    /** Load the underlying store. */
    loadAsync(...args) {
        return this.store.loadAsync(...args);
    }

    /** Load the underlying store. */
    loadData(...args) {
        return this.store.loadData(...args);
    }

    /** @return {Column[]} */
    cloneColumns() {
        return [...this.columns];
    }

    /** @param {(Column[]|Object[])} cols - Columns, or configs to create them. */
    @action
    setColumns(cols) {
        const columns = this.buildColumns(cols);
        this.validateColumns(columns);
        this.columns = columns;
    }

    //-----------------------
    // Implementation
    //-----------------------
    buildColumns(colsOrConfigs) {
        return colsOrConfigs.map(c => {
            return c instanceof Column ? c : new Column(c);
        });
    }

    findColumn(cols, id) {
        for (let col of cols) {
            if (col.colId == id) return col;
        }
        return null;
    }

    validateColumns(cols) {
        if (isEmpty(cols)) return;

        const colIds = cols.map(col => col.colId),
            colsHaveDupes = colIds.length != uniq(colIds).length;

        throwIf(colsHaveDupes, 'All colIds in column collection must be unique.');

        warnIf(
            !cols.some(c => c.flex),
            `No columns have flex set (flex=true). Consider making the last column a flex column, 
            or adding an 'emptyFlexCol' at the end of your columns array.`
        );
    }

}