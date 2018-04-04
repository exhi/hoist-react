/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {action, observable} from 'hoist/mobx';
import {LastPromiseModel} from 'hoist/promise';
import {castArray, find, isString} from 'lodash';
import {GridSelectionModel} from './GridSelectionModel';
import {GridContextMenu} from './GridContextMenu';

/**
 * Core Model for a Grid, specifying the grid's data store, column definitions,
 * sorting/grouping/selection state, and context menu configuration.
 */
export class GridModel {

    // Immutable public properties
    store = null;
    gridApi = null;
    selection = null;
    loadModel = new LastPromiseModel();
    contextMenuFn = null

    @observable.ref columns = [];
    @observable.ref sortBy = [];
    @observable groupBy = null;

    static defaultContextMenu = () => {
        return new GridContextMenu([
            'copy',
            'copyWithHeaders',
            '-',
            'export',
            'autoSizeAll'
        ]);
    }

    /**
     * @param {BaseStore} store, store containing the data for the grid.
     * @param {Object[]} columns - collection of column specifications.
     * @param {Object[]} sortBy - one or more sorters to apply to store data.
     * @param {string} sortBy[].colId - Column ID by which to sort.
     * @param {string} sortBy[].sort - sort direction [asc|desc].
     * @param {string} groupBy - Column ID by which to group.
     * @param {function} contextMenuFn - closure returning a GridContextMenu().
     */
    constructor({
        store,
        columns,
        sortBy = [],
        groupBy = null,
        contextMenuFn = GridModel.defaultContextMenu
    }) {
        this.store = store;
        this.columns = columns;
        this.contextMenuFn = contextMenuFn;
        this.selection = new GridSelectionModel({parent: this});
        this.setGroupBy(groupBy);
        this.setSortBy(sortBy);
    }

    exportDataAsExcel(params) {
        if (!this.gridApi) return;
        params.processCellCallback = this.formatValuesForExport;
        this.gridApi.exportDataAsExcel(params);
    }

    @action
    setGroupBy(field) {
        const cols = this.columns;

        cols.forEach(it => {
            if (it.rowGroup) {
                it.rowGroup = false;
                it.hide = false;
            }
        });

        if (field) {
            const col = find(cols, {field});
            if (col) {
                col.rowGroup = true;
                col.hide = true;
            }
        }
        
        this.columns = [...cols];
    }

    @action
    setSortBy(sortBy) {
        // Normalize string, and partially specified values
        sortBy = castArray(sortBy);
        sortBy = sortBy.map(it => {
            if (isString(it)) it = {colId: it};
            it.sort = it.sort || 'asc';
            return it;
        });

        this.sortBy = sortBy;
    }


    //-----------------------
    // Implementation
    //-----------------------
    formatValuesForExport(params) {
        const value = params.value,
            fmt = params.column.colDef.valueFormatter;
        if (value !== null && fmt) {
            return fmt(value);
        } else {
            return value;
        }
    }
}