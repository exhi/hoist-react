/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {AgGrid} from '@xh/hoist/cmp/ag-grid';
import {GridModel} from '@xh/hoist/cmp/grid';
import {GridSorter} from '@xh/hoist/cmp/grid/impl/GridSorter';
import {HoistModel, managed} from '@xh/hoist/core';
import {bindable, computed} from '@xh/hoist/mobx';
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
    @bindable
    groupRowHeight;

    groupRowRenderer;

    /**
     * @param {Object} c - DataViewModel configuration.
     * @param {(Store|Object)} c.store - a Store instance, or a config to create one.
     * @param {Column~elementRendererFn} c.itemRenderer - function returning a React element for
     *      each data row.
     * @param {number} itemHeight - Row height (in px) for each item displayed in the view.
     * @param {string} [c.groupBy] - Column ID by which to do full-width row grouping.
     * @param {number} [c.groupRowHeight] - Height (in px) of a group row.
     * @param {function} [c.groupRowRenderer] - function returning a React element for group rows.
     * @param {(string|string[]|Object|Object[])} [c.sortBy] - colId(s) or sorter config(s) with
     *      `colId` and `sort` (asc|desc) keys.
     * @param {(StoreSelectionModel|Object|String)} [c.selModel] - StoreSelectionModel, or a
     *      config or string `mode` from which to create.
     * @param {string} [c.emptyText] - text/HTML to display if view has no records.
     * @param {boolean} [c.showHover] - true to highlight the currently hovered row.
     * @param {boolean} [c.rowBorders] - true to render row borders.
     * @param {boolean} [c.stripeRows] - true to use alternating backgrounds for rows.
     * @param {(Object[]|GridStoreContextMenuFn)} [c.contextMenu] - array of RecordActions, configs
     *      or token strings with which to create grid context menu items.  May also be specified
     *      as a function returning a StoreContextMenu. Desktop only.
     * @param {RowClassFn} [c.rowClassFn] - closure to generate CSS class names for a row.
     * @param {Object} [c.gridModelConfig] - additional configs passed to the underlying gridModel.
     *      Note this is for advanced usage - not all configs supported, and many will override
     *      DataView defaults in ways that will break this component.
     */
    constructor({
        store,
        itemRenderer,
        itemHeight,
        groupBy,
        groupRowHeight,
        groupRowRenderer,
        sortBy = [],
        selModel,
        emptyText,
        showHover= false,
        rowBorders= false,
        stripeRows = false,
        contextMenu = null,
        rowClassFn,
        gridModelConfig = {}
    }) {
        sortBy = castArray(sortBy);
        throwIf(sortBy.length > 1, 'DataViewModel does not support multiple sorters.');
        throwIf(!isNumber(itemHeight), 'Must specify DataViewModel.itemHeight as a number to set a fixed pixel height for each item.');

        this.itemHeight = itemHeight;
        this.groupRowHeight = groupRowHeight;
        this.groupRowRenderer = groupRowRenderer;

        // We only have a single visible column in our DataView grid and rely on ag-Grid for sorting,
        // initially and through updates via transactions. For this reason, we set the field of our
        // single column to the desired sort field. (The field setting should not have any other
        // meaningful impact on the grid, since we use a custom renderer and mark it as complex to
        // ensure each item re-renders on any record change.)
        let field = 'id';
        if (sortBy.length === 1) {
            let sorter = sortBy[0];
            if (!(sorter instanceof GridSorter)) sorter = GridSorter.parse(sorter);
            field = sorter.colId;
        }

        const columns = [{
            field,
            flex: true,
            elementRenderer: itemRenderer,
            rendererIsComplex: true
        }];

        if (groupBy) {
            columns.push({field: groupBy, hidden: true});
        }

        this.gridModel = new GridModel({
            store,
            sortBy,
            selModel,
            contextMenu,
            emptyText,
            showHover,
            rowBorders,
            stripeRows,
            groupBy,
            rowClassFn,
            columns,
            ...gridModelConfig
        });

        this.addReaction({
            track: () => [this.itemHeight, this.groupRowHeight],
            run: () => this.gridModel.agApi?.resetRowHeights()
        });
    }


    // Getters and methods trampolined from GridModel.
    // Explicit trampolining to aid code-editor, future docs.
    get store()                 {return this.gridModel.store}
    get empty()                 {return this.gridModel.empty}
    get selModel()              {return this.gridModel.selModel}
    get hasSelection()          {return this.gridModel.hasSelection}
    get selection()             {return this.gridModel.selection}
    get selectedRecord()        {return this.gridModel.selectedRecord}

    selectFirst()               {return this.gridModel.selectFirst()}
    ensureSelectionVisible()    {return this.gridModel.ensureSelectionVisible()}
    doLoadAsync(loadSpec)       {return this.gridModel.doLoadAsync(loadSpec)}
    loadData(...args)           {return this.gridModel.loadData(...args)}
    updateData(...args)         {return this.gridModel.updateData(...args)}
    clear()                     {return this.gridModel.clear()}

    @computed
    get agOptions() {
        // Pull these out here to ensure computed re-runs when they change.
        const {itemHeight, groupRowHeight, groupRowRenderer} = this;
        return {
            headerHeight: 0,
            getRowHeight: (params) => {
                // Return (required) itemHeight for data rows.
                if (!params.node?.group) return itemHeight;

                // For group rows, return groupRowHeight if specified, or use standard height
                // (DataView does not participate in grid sizing modes.)
                return groupRowHeight ?? AgGrid.getRowHeightForSizingMode('standard');
            },
            ...(groupRowRenderer ? {groupRowRendererFramework: groupRowRenderer} : {})
        };
    }

}
