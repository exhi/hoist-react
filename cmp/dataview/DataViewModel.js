/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {HoistModel, managed} from '@xh/hoist/core';
import {GridModel} from '@xh/hoist/cmp/grid';
import {GridSorter} from '@xh/hoist/cmp/grid/impl/GridSorter';
import {bindable} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';
import {castArray, isNumber} from 'lodash';

/**
 * DataViewModel is a wrapper around GridModel, which shows sorted data in a single column,
 * using a configured component for rendering each item.
 *
 * This is the primary app entry-point for specifying DataView component options and behavior.
 */
@HoistModel
export class DataViewModel {

    @managed
    gridModel;

    @bindable
    itemHeight;

    /**
     * @param {Object} c - DataViewModel configuration.
     * @param {number} itemHeight - Row height for each item displayed in the view
     * @param {Column~elementRendererFn} c.itemRenderer - function which returns a React component.
     * @param {(Store|Object)} c.store - a Store instance, or a config with which to create a
     *      default Store. The store is the source for the view's data.
     * @param {(string|string[]|Object|Object[])} [c.sortBy] - colId(s) or sorter config(s) with
     *      `colId` and `sort` (asc|desc) keys.
     * @param {(StoreSelectionModel|Object|String)} [c.selModel] - StoreSelectionModel, or a
     *      config or string `mode` from which to create.
     * @param {string} [c.emptyText] - text/HTML to display if view has no records.
     * @param {(Object[]|GridStoreContextMenuFn)} [c.contextMenu] - array of RecordActions, configs or token
     *      strings with which to create grid context menu items.  May also be specified as a
     *      function returning a StoreContextMenu.  Desktop only.
     * @param {string} groupBy - Column ID by which to do full-width row grouping.
     * @param {number} groupedItemHeight - Height of a group row
     */
    constructor({
        itemHeight,
        itemRenderer,
        store,
        sortBy = [],
        selModel,
        emptyText,
        contextMenu = null,
        groupBy,
        groupedItemHeight
    }) {
        sortBy = castArray(sortBy);
        throwIf(sortBy.length > 1, 'DataViewModel does not support multiple sorters.');
        throwIf(!isNumber(itemHeight), 'Must specify a number for itemHeight in DataViewModel.');

        this.itemHeight = itemHeight;
        this.groupedItemHeight = groupedItemHeight;

        // We only have a single column in our DataView grid, and we also rely on ag-Grid to keep
        // the data sorted, initially and through updates via transactions. To continue leveraging
        // the grid for sort, set the field of our single column to the desired sort field. (The
        // field setting should not have any other meaningful impact on the grid, since we use a
        // custom renderer and mark it as complex to ensure re-renders on any record change.)
        let field = 'id';
        if (sortBy.length === 1) {
            let sorter = sortBy[0];
            if (!(sorter instanceof GridSorter)) sorter = GridSorter.parse(sorter);
            field = sorter.colId;
        }

        let columns = [
            {
                field,
                flex: true,
                elementRenderer: itemRenderer,
                rendererIsComplex: true
            }
        ];
        if (groupBy) {
            columns.push({
                field: groupBy,
                hidden: true
            });
        }

        this.gridModel = new GridModel({
            store,
            sortBy,
            selModel,
            contextMenu,
            emptyText,
            groupBy,
            columns
        });

        this.addReaction({
            track: () => this.itemHeight,
            run: () => this.gridModel.agApi?.resetRowHeights()
        });
    }

    get store() {return this.gridModel.store}
    get selModel() {return this.gridModel.selModel}

    /** Select the first record in the DataView. */
    selectFirst() {
        this.gridModel.selectFirst();
    }

    /**
     * Shortcut to the currently selected records (observable).
     * @see StoreSelectionModel.records
     */
    get selection() {
        return this.selModel.records;
    }

    /**
     * Shortcut to a single selected record (observable), or null if multiple records selected.
     * @see StoreSelectionModel.singleRecord
     */
    get selectedRecord() {
        return this.selModel.singleRecord;
    }

    /** Load the underlying store. */
    doLoadAsync(loadSpec) {
        throwIf(!this.store.isLoadSupport, 'Underlying store does not define support for loading.');
        return this.store.loadAsync(loadSpec);
    }

    /** Load the underlying store. */
    loadData(...args) {
        return this.store.loadData(...args);
    }

    /** Update the underlying store. */
    updateData(...args) {
        return this.store.updateData(...args);
    }

    /** Clear the underlying store, removing all rows. */
    clear() {
        this.store.clear();
    }

}
