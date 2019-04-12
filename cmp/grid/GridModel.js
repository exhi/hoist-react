/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, LoadSupport, XH} from '@xh/hoist/core';
import {Column, ColumnGroup} from '@xh/hoist/cmp/grid';
import {BaseStore, LocalStore, StoreSelectionModel} from '@xh/hoist/data';
import {ColChooserModel as DesktopColChooserModel, StoreContextMenu} from '@xh/hoist/dynamics/desktop';
import {ColChooserModel as MobileColChooserModel} from '@xh/hoist/dynamics/mobile';
import {action, observable, bindable} from '@xh/hoist/mobx';
import {ensureUnique, throwIf, warnIf, withDefault} from '@xh/hoist/utils/js';
import {
    castArray,
    cloneDeep,
    compact,
    defaults,
    find,
    findLast,
    isArray,
    isEmpty,
    isNil,
    isPlainObject,
    isString,
    last,
    map,
    pull,
    sortBy,
    uniq,
    difference
} from 'lodash';
import {GridStateModel} from './GridStateModel';
import {GridSorter} from './impl/GridSorter';


/**
 * Core Model for a Grid, specifying the grid's data store, column definitions,
 * sorting/grouping/selection state, and context menu configuration.
 *
 * This is the primary application entry-point for specifying Grid component options and behavior.
 *
 * This model also supports nested tree data. To show a tree:
 *   1) Bind this model to a store with hierarchical records.
 *   2) Set `treeMode: true` on this model.
 *   3) Include a single column with `isTreeColumn: true`. This column will provide expand /
 *      collapse controls and indent child columns in addition to displaying its own data.
 *
 */
@HoistModel
@LoadSupport
export class GridModel {

    //------------------------
    // Immutable public properties
    //------------------------
    /** @member {BaseStore} */
    store;
    /** @member {StoreSelectionModel} */
    selModel;
    /** @member {boolean} */
    treeMode;
    /** @member {GridStateModel} */
    stateModel;
    /** @member {ColChooserModel} */
    colChooserModel;
    /** @member {function} */
    rowClassFn;
    /** @member {function} */
    contextMenuFn;
    /** @member {function} */
    groupSortFn;
    /** @member {boolean} */
    enableExport;
    /** @member {object} */
    exportOptions;

    //------------------------
    // Observable API
    //------------------------
    /** @member {Object[]} - {@link Column} and {@link ColumnGroup} objects */
    @observable.ref columns = [];
    /** @member {ColumnState[]} */
    @observable.ref columnState = [];
    /** @member {GridSorter[]} */
    @observable.ref sortBy = [];
    /** @member {string[]} */
    @observable groupBy = null;

    /** @member {boolean} */
    @bindable compact;
    /** @member {boolean} */
    @bindable rowBorders;
    /** @member {boolean} */
    @bindable stripeRows;
    /** @member {boolean} */
    @bindable showHover;
    /** @member {boolean} */
    @bindable showCellFocus;

    /** @member {GridApi} */
    @observable.ref agApi = null;
    /** @member {ColumnApi} */
    @observable.ref agColumnApi = null;

    static defaultContextMenuTokens = [
        'copy',
        'copyWithHeaders',
        '-',
        'expandCollapseAll',
        '-',
        'exportExcel',
        'exportCsv',
        '-',
        'colChooser'
    ];

    /**
     * @param {Object} c - GridModel configuration.
     * @param {Object[]} c.columns - {@link Column} or {@link ColumnGroup} configs
     * @param {(BaseStore|Object)} [c.store] - a Store instance, or a config with which to create a
     *      default LocalStore. If not supplied, store fields will be inferred from columns config.
     * @param {boolean} [c.treeMode] - true if grid is a tree grid (default false).
     * @param {(StoreSelectionModel|Object|String)} [c.selModel] - StoreSelectionModel, or a
     *      config or string `mode` with which to create one.
     * @param {(Object|string)} [c.stateModel] - config or string `gridId` for a GridStateModel.
     * @param {?string} [c.emptyText] - text/HTML to display if grid has no records.
     *      Defaults to null, in which case no empty text will be shown.
     * @param {(string|string[]|Object|Object[])} [c.sortBy] - colId(s) or sorter config(s) with
     *      colId and sort direction.
     * @param {(string|string[])} [c.groupBy] - Column ID(s) by which to do full-width row grouping.
     * @param {boolean} [c.compact] - true to render with a smaller font size and tighter padding.
     * @param {boolean} [c.rowBorders] - true to render row borders.
     * @param {boolean} [c.stripeRows] - true (default) to use alternating backgrounds for rows.
     * @param {boolean} [c.showHover] - true to highlight the currently hovered row.
     * @param {boolean} [c.showCellFocus] - true to highlight the focused cell with a border.
     * @param {boolean} [c.enableColChooser] - true to setup support for column chooser UI and
     *      install a default context menu item to launch the chooser.
     * @param {boolean} [c.enableExport] - true to enable exporting this grid and
     *      install default context menu items.
     * @param {object} [c.exportOptions] - default options used in exportAsync().
     * @param {function} [c.rowClassFn] - closure to generate css class names for a row.
     *      Called with record data, returns a string or array of strings.
     * @param {function} [c.groupSortFn] - closure to sort full-row groups. Called with two nodes to
     *      be compared, returns a number as per a standard JS comparator.
     * @param {GridStoreContextMenuFn} [c.contextMenuFn] - function to optionally return a
     *      StoreContextMenu when the grid is right-clicked (desktop only).
     * @param {*} [c...rest] - additional data to attach to this model instance.
     */
    constructor({
        store,
        columns,
        treeMode = false,
        selModel,
        stateModel = null,
        emptyText = null,
        sortBy = [],
        groupBy = null,

        compact = false,
        showHover = false,
        rowBorders = false,
        stripeRows = true,
        showCellFocus = false,

        enableColChooser = false,
        enableExport = false,
        exportOptions = {},
        rowClassFn = null,
        groupSortFn,
        contextMenuFn,
        ...rest
    }) {
        this.treeMode = treeMode;
        this.emptyText = emptyText;
        this.rowClassFn = rowClassFn;
        this.groupSortFn = withDefault(groupSortFn, this.defaultGroupSortFn);
        this.contextMenuFn = withDefault(contextMenuFn, this.defaultContextMenuFn);

        this.enableExport = enableExport;
        this.exportOptions = exportOptions;

        Object.assign(this, rest);

        this.setColumns(columns);
        this.store = this.parseStore(store);

        this.setGroupBy(groupBy);
        this.setSortBy(sortBy);

        this.compact = compact;
        this.showHover = showHover;
        this.rowBorders = rowBorders;
        this.stripeRows = stripeRows;
        this.showCellFocus = showCellFocus;

        this.colChooserModel = enableColChooser ? this.createChooserModel() : null;
        this.selModel = this.parseSelModel(selModel);
        this.stateModel = this.parseStateModel(stateModel);
    }

    /**
     * Export grid data using Hoist's server-side export.
     *
     * @param {Object} options - Export options. See GridExportService.exportAsync() for options.
     */
    async exportAsync(options = {}) {
        throwIf(!this.enableExport, 'Export not enabled for this grid. See GridModel.enableExport');
        return XH.gridExportService.exportAsync(this, {...this.exportOptions, ...options});
    }

    /**
     * Export grid data using ag-Grid's built-in client-side export.
     *
     * @param {string} filename - name for exported file.
     * @param {string} type - type of export - one of ['excel', 'csv'].
     * @param {Object} params - passed to agGrid's export functions.
     */
    localExport(filename, type, params = {}) {
        if (!this.agApi) return;
        defaults(params, {fileName: filename, processCellCallback: this.formatValuesForExport});

        if (type === 'excel') {
            this.agApi.exportDataAsExcel(params);
        } else if (type === 'csv') {
            this.agApi.exportDataAsCsv(params);
        }
    }

    /** Select the first row in the grid. */
    selectFirst() {
        const {agApi, selModel} = this;

        // Find first displayed row with data - i.e. backed by a record, not a full-width group row.
        if (agApi) {
            let record = null;
            agApi.forEachNodeAfterFilterAndSort(node => {
                if (!record && node.data) record = node.data;
            });

            if (record) selModel.select(record);
        }
    }

    /** Does the grid have any records to show? */
    get empty() {
        return this.store.empty;
    }

    /** Are any records currently selected? */
    get hasSelection() {
        return !this.selModel.isEmpty;
    }

    /**
     * Shortcut to the currently selected records (observable).
     * @see StoreSelectionModel.records
     */
    get selection() {
        return this.selModel.records;
    }

    /**
     * Shortcut to a single selected record (observable).
     * Null if multiple records are selected.
     * @see StoreSelectionModel.singleRecord
     */
    get selectedRecord() {
        return this.selModel.singleRecord;
    }

    @action
    setAgApi(agApi) {
        this.agApi = agApi;
    }

    @action
    setAgColumnApi(columnApi) {
        this.agColumnApi = columnApi;
    }

    /**
     * Apply full-width row-level grouping to the grid for the given column ID(s).
     * This method is no-op if provided any ids without a corresponding column.
     * @param {(string|string[])} colIds - column ID(s) for row grouping, or falsey value to ungroup.
     */
    @action
    setGroupBy(colIds) {
        if (!colIds) {
            this.groupBy = [];
            return;
        }

        colIds = castArray(colIds);

        const invalidColIds = colIds.filter(it => !this.findColumn(this.columns, it));
        if (invalidColIds.length) {
            console.warn('groupBy colId not found in grid columns', invalidColIds);
            return;
        }

        this.groupBy = colIds;
    }

    /** Expand all parent rows in grouped or tree grid. (Note, this is recursive for trees!) */
    expandAll() {
        const {agApi} = this;
        if (agApi) {
            agApi.expandAll();
            agApi.sizeColumnsToFit();
        }
    }

    /** Collapse all parent rows in grouped or tree grid. */
    collapseAll() {
        const {agApi} = this;
        if (agApi) {
            agApi.collapseAll();
            agApi.sizeColumnsToFit();
        }
    }

    /**
     * This method is no-op if provided any sorters without a corresponding column.
     * @param {(string|string[]|Object|Object[])} sorters - colId(s), GridSorter config(s)
     *      GridSorter strings, or a falsey value to clear the sort config.
     */
    @action
    setSortBy(sorters) {
        if (!sorters) {
            this.sortBy = [];
            return;
        }

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

    /** Load the underlying store. */
    async doLoadAsync(loadSpec) {
        throwIf(!this.store.isLoadSupport, 'Underlying store does not define support for loading.');
        return this.store.loadAsync(loadSpec);
    }

    /** Load the underlying store. */
    loadData(...args) {
        return this.store.loadData(...args);
    }

    /** @param {Object[]} colConfigs - {@link Column} or {@link ColumnGroup} configs. */
    @action
    setColumns(colConfigs) {
        throwIf(
            !isArray(colConfigs),
            'GridModel requires an array of column configurations.'
        );

        throwIf(
            colConfigs.some(c => !isPlainObject(c)),
            'GridModel only accepts plain objects for Column or ColumnGroup configs'
        );

        const columns = colConfigs.map(c => this.buildColumn(c));

        this.validateColumns(columns);

        this.columns = columns;
        this.columnState = this.getLeafColumns()
            .map(({colId, width, hidden}) => ({colId, width, hidden}));
    }

    showColChooser() {
        if (this.colChooserModel) {
            this.colChooserModel.open();
        }
    }

    noteAgColumnStateChanged(agColState) {
        const colStateChanges = agColState.map(({colId, width, hide}) => {
            const col = this.findColumn(this.columns, colId);
            if (!col) return null;
            return {
                colId,
                hidden: hide,
                width: col.flex ? undefined : width
            };
        });

        pull(colStateChanges, null);
        this.applyColumnStateChanges(colStateChanges);
    }

    /**
     * This method will update the current column definition. Throws an exception if any of the
     * columns provided in colStateChanges are not present in the current column list.
     *
     * Note: Column ordering is determined by the individual (leaf-level) columns in state.
     * This means that if a column has been redefined to a new column group, that entire group may
     * be moved to a new index.
     *
     * @param {ColumnState[]} colStateChanges - changes to apply to the columns. If all leaf
     *     columns are represented in these changes then the sort order will be applied as well.
     */
    @action
    applyColumnStateChanges(colStateChanges) {
        let columnState = cloneDeep(this.columnState);

        throwIf(colStateChanges.some(({colId}) => !this.findColumn(columnState, colId)),
            'Invalid columns detected in column changes!');

        // 1) Update any width or visibility changes
        colStateChanges.forEach(change => {
            const col = this.findColumn(columnState, change.colId);

            if (!isNil(change.width)) col.width = change.width;
            if (!isNil(change.hidden)) col.hidden = change.hidden;
        });

        // 2) If the changes provided is a full list of leaf columns, synchronize the sort order
        const leafCols = this.getLeafColumns();
        if (colStateChanges.length === leafCols.length) {
            // 2.a) Mark (potentially changed) sort order
            colStateChanges.forEach((change, index) => {
                const col = this.findColumn(columnState, change.colId);
                col._sortOrder = index;
            });

            // 2.b) Install implied group sort orders and sort
            columnState.forEach(it => this.markGroupSortOrder(it));
            columnState = this.sortColumns(columnState);

            // 2.c) Force any emptyFlexCol that is last to stay last (avoid user dragging)!
            const emptyFlex = findLast(columnState, {colId: 'emptyFlex'});
            if (emptyFlex && last(this.columns).colId === 'emptyFlex' && last(columnState) !== emptyFlex) {
                pull(columnState, emptyFlex).push(emptyFlex);
            }
        }

        this.columnState = columnState;
    }

    /**
     * Return all leaf-level columns - i.e. excluding column groups.
     * @returns {Column[]}
     */
    getLeafColumns() {
        return this.gatherLeaves(this.columns);
    }

    /**
     * Determine whether or not a given leaf-level column is currently visible.
     *
     * Call this method instead of inspecting the `hidden` property on the Column itself, as that
     * property is not updated with state changes.
     *
     * @param {String} colId
     * @returns {boolean}
     */
    isColumnVisible(colId) {
        const state = this.getStateForColumn(colId);
        return state ? !state.hidden : false;
    }

    /**
     * Return matching leaf-level Column or ColumnState object from the provided collection for the
     * given colId, if any. Used as a utility function to find both types of objects.
     */
    findColumn(cols, colId) {
        for (let col of cols) {
            if (col.children) {
                const ret = this.findColumn(col.children, colId);
                if (ret) return ret;
            } else {
                if (col.colId == colId) return col;
            }
        }
        return null;
    }

    /**
     * Return the current state object representation for the given colId.
     *
     * Note that column state updates do not write changes back to the original Column object (as
     * held in this model's `columns` collection), so this method should be called whenever the
     * current value of any state-tracked property is required.
     *
     * @param {string} colId
     * @returns {ColumnState}
     */
    getStateForColumn(colId) {
        return find(this.columnState, {colId});
    }

    buildColumn(c) {
        return c.children ? new ColumnGroup(c, this) : new Column(c, this);
    }
    
    //-----------------------
    // Implementation
    //-----------------------
    gatherLeaves(columns, leaves = []) {
        columns.forEach(col => {
            if (col.groupId) this.gatherLeaves(col.children, leaves);
            if (col.colId) leaves.push(col);
        });

        return leaves;
    }

    markGroupSortOrder(col) {
        if (col.groupId) {
            col.children.forEach(child => this.markGroupSortOrder(child));
            col._sortOrder = col.children[0]._sortOrder;
        }
    }

    sortColumns(columns) {
        columns.forEach(col => {
            if (col.children) {
                col.children = this.sortColumns(col.children);
            }
        });

        return sortBy(columns, [it => it._sortOrder]);
    }

    validateColumns(cols) {
        if (isEmpty(cols)) return;

        const {groupIds, colIds} = this.collectIds(cols);

        ensureUnique(colIds, 'All colIds in a GridModel columns collection must be unique.');
        ensureUnique(groupIds, 'All groupIds in a GridModel columns collection must be unique.');

        const treeCols = cols.filter(it => it.isTreeColumn);
        warnIf(
            this.treeMode && treeCols.length != 1,
            'Grids in treeMode should include exactly one column with isTreeColumn:true.'
        );
    }

    collectIds(cols, groupIds = [], colIds = []) {
        cols.forEach(col => {
            if (col.colId) colIds.push(col.colId);
            if (col.groupId) {
                groupIds.push(col.groupId);
                this.collectIds(col.children, groupIds, colIds);
            }
        });
        return {groupIds, colIds};
    }

    formatValuesForExport(params) {
        const value = params.value,
            fmt = params.column.colDef.valueFormatter;
        if (value !== null && fmt) {
            return fmt(value);
        } else {
            return value;
        }
    }

    parseStore(store) {
        store = withDefault(store, {});

        if (store instanceof BaseStore) {
            return store;
        }

        if (isPlainObject(store)) {

            // Ensure store config has a complete set of fields for all configured columns.
            const fields = store.fields || [],
                storeFieldNames = map(fields, it => isString(it) ? it : it.name),
                colFieldNames = uniq(compact(map(this.getLeafColumns(), 'field'))),
                missingFieldNames = difference(colFieldNames, storeFieldNames);

            if (missingFieldNames.length) {
                store = {
                    ...store,
                    fields: [...fields, ...missingFieldNames]
                };
            }

            return this.markManaged(new LocalStore(store));
        }

        throw XH.exception('The GridModel.store config must be either a concrete instance of BaseStore or a config to create one.');
    }

    parseSelModel(selModel) {
        selModel = withDefault(selModel, XH.isMobile ? 'disabled' : 'single');

        if (selModel instanceof StoreSelectionModel) {
            return selModel;
        }

        if (isPlainObject(selModel)) {
            return this.markManaged(new StoreSelectionModel(defaults(selModel, {store: this.store})));
        }

        // Assume its just the mode...
        let mode = 'single';
        if (isString(selModel)) {
            mode = selModel;
        } else if (selModel === null) {
            mode = 'disabled';
        }
        return this.markManaged(new StoreSelectionModel({mode, store: this.store}));
    }

    parseStateModel(stateModel) {
        let ret = null;
        if (isPlainObject(stateModel)) {
            ret = new GridStateModel(stateModel);
        } else if (isString(stateModel)) {
            ret = new GridStateModel({gridId: stateModel});
        }
        if (ret) {
            ret.init(this);
            this.markManaged(ret);
        }
        return ret;
    }

    createChooserModel() {
        const Model = XH.isMobile ? MobileColChooserModel : DesktopColChooserModel;
        return this.markManaged(new Model(this));
    }

    defaultContextMenuFn = (agParams, gridModel) => {
        if (XH.isMobile) return null;
        return new StoreContextMenu({
            items: GridModel.defaultContextMenuTokens,
            gridModel
        });
    }

    defaultGroupSortFn = (nodeA, nodeB) => {
        const a = nodeA.key, b = nodeB.key;
        return a < b ? -1 : (a > b ? 1 : 0);
    }

}

/**
 * @typedef {Object} ColumnState
 * @property {string} colId - unique identifier of the column
 * @property {number} [width] - new width to set for the column
 * @property {boolean} [hidden] - visibility of the column
 */

/**
 * @callback GridStoreContextMenuFn - context menu factory function, provided to GridModel.
 * @param {GetContextMenuItemsParams} params - raw event params from ag-Grid
 * @param {GridModel} gridModel - controlling GridModel instance
 * @returns {StoreContextMenu} - context menu to display, or null
 */
