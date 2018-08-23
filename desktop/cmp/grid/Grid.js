/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component, isValidElement} from 'react';
import {PropTypes as PT} from 'prop-types';
import {find, isBoolean, isEqual, isNil, isNumber, isString, merge, xor} from 'lodash';
import {observable, runInAction} from '@xh/hoist/mobx';
import {elemFactory, HoistComponent, LayoutSupport, XH} from '@xh/hoist/core';
import {box, fragment} from '@xh/hoist/cmp/layout';
import {convertIconToSvg, Icon} from '@xh/hoist/icon';
import './ag-grid';
import {agGridReact, navigateSelection} from './ag-grid';
import {colChooser} from './ColChooser';

/**
 * The primary rich data grid component within the Hoist desktop toolkit.
 * It is a highly managed wrapper around ag-Grid and is the main display component for GridModel.
 *
 * Applications should typically configure and interact with Grids via a GridModel, which provides
 * support for specifying the Grid's data Store, Column definitions, sorting and grouping state,
 * selection API, and more.
 *
 * Use this Component's props to control the ag-Grid-specific UI options and handlers.
 * @see {@link https://www.ag-grid.com/javascript-grid-reference-overview/|ag-Grid Docs}
 * @see GridModel
 */
@HoistComponent()
@LayoutSupport
export class Grid extends Component {

    static propTypes = {

        /**
         * Options for AG Grid's API.
         *
         * This constitutes an 'escape hatch' for applications that need to get to the underlying
         * ag-Grid API.  It should be used with care. Settings made here might be overwritten and/or
         * interfere with the implementation of this component and its use of the ag-Grid API.
         */
        agOptions: PT.object,

        /**
         * Callback to call when a row is double clicked.  Function will receive an event
         * with a data node containing the row's data.
         * @see {@link https://www.ag-grid.com/javascript-grid-events/#properties-and-hierarchy|ag-Grid Event Docs}
         */
        onRowDoubleClicked: PT.func
    };

    static ROW_HEIGHT = 28;
    static COMPACT_ROW_HEIGHT = 22;

    // Observable stamp incremented every time the ag-Grid receives a new set of data.
    // Used to ensure proper re-running / sequencing of data and selection reactions.
    @observable _dataVersion = 0;

    baseClassName = 'xh-grid';

    constructor(props) {
        super(props);
        this.addReaction(this.selectionReaction());
        this.addReaction(this.sortReaction());
        this.addReaction(this.columnsReaction());
        this.addReaction(this.dataReaction());
        this.addReaction(this.compactReaction());
    }

    render() {
        const {colChooserModel, compact} = this.model,
            {agOptions} = this.props,
            layoutProps = this.getLayoutProps();

        // Default flex = 'auto' if no dimensions / flex specified.
        if (layoutProps.width == null && layoutProps.height == null && layoutProps.flex == null) {
            layoutProps.flex = 'auto';
        }

        // Note that we intentionally do *not* render the agGridReact element below with either the data
        // or the columns. These two bits are the most volatile in our GridModel, and this causes
        // extra re-rendering and jumpiness.  Instead, we rely on the API methods to keep these in sync.
        return fragment(
            box({
                ...layoutProps,
                item: agGridReact(merge(this.createDefaultAgOptions(), agOptions)),
                className: this.getClassName(
                    'ag-grid-holder',
                    XH.darkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham',
                    compact ? 'xh-grid-compact' : 'xh-grid-standard'
                )
            }),
            colChooser({
                omit: !colChooserModel,
                model: colChooserModel
            })
        );
    }


    //------------------------
    // Implementation
    //------------------------
    createDefaultAgOptions() {
        const {model, props} = this;

        return {
            toolPanelSuppressSideButtons: true,
            enableSorting: true,
            enableColResize: true,
            deltaRowDataMode: true,
            getRowNodeId: (data) => data.id,
            allowContextMenuWithControlKey: true,
            defaultColDef: {suppressMenu: true},
            groupDefaultExpanded: 1,
            groupUseEntireRow: true,
            popupParent: document.querySelector('body'),
            navigateToNextCell: this.onNavigateToNextCell,
            defaultGroupSortComparator: this.sortByGroup,
            icons: {
                groupExpanded: convertIconToSvg(
                    Icon.chevronDown(),
                    {classes: ['group-header-icon-expanded']}
                ),
                groupContracted: convertIconToSvg(
                    Icon.chevronRight(),
                    {classes: ['group-header-icon-contracted']}
                )
            },
            rowSelection: model.selModel.mode,
            rowDeselection: true,
            getRowHeight: () => model.compact ? Grid.COMPACT_ROW_HEIGHT : Grid.ROW_HEIGHT,
            overlayNoRowsTemplate: model.emptyText || '<span></span>',
            getContextMenuItems: this.getContextMenuItems,
            onRowDoubleClicked: props.onRowDoubleClicked,
            onGridReady: this.onGridReady,
            onSelectionChanged: this.onSelectionChanged,
            onSortChanged: this.onSortChanged,
            onGridSizeChanged: this.onGridSizeChanged,
            onDragStopped: this.onDragStopped
        };
    }

    //------------------------
    // Support for defaults
    //------------------------
    getColumnDefs() {
        const {columns, sortBy} = this.model;
        const cols = columns.map(c => c.getAgSpec());
        
        let now = Date.now();
        sortBy.forEach(it => {
            const col = find(cols, {colId: it.colId});
            if (col) {
                col.sort = it.sort;
                col.sortedAt = now++;
            }
        });
        return cols;
    }

    getContextMenuItems = (params) => {
        // TODO: Display this as Blueprint Context menu e.g:
        // ContextMenu.show(contextMenu({menuItems}), {left:0, top:0}, () => {});

        const {store, selModel, contextMenuFn} = this.model;
        if (!contextMenuFn) return null;

        const menu = contextMenuFn(params, this.model),
            recId = params.node ? params.node.id : null,
            rec = isNil(recId) ? null : store.getById(recId, true),
            selectedIds = selModel.ids;

        // Adjust selection to target record -- and sync to grid immediately.
        if (rec && !(selectedIds.includes(recId))) {
            selModel.select(rec);
        }
        if (!rec) selModel.clear();
        const {count} = selModel;

        // Prepare each item
        const items = menu.items;
        items.forEach(it => {
            if (it.prepareFn) it.prepareFn(it, rec, selModel);
        });

        return items.filter(it => {
            return !it.hidden;
        }).filter((it, idx, arr) => {
            if (it === '-') {
                // Remove consecutive separators
                const prev = idx > 0 ? arr[idx - 1] : null;
                if (prev === '-') return false;
            }
            return true;
        }).filter((it, idx, arr) => {
            // Remove starting / ending separators
            return it !== '-' || (idx > 0 && idx < arr.length - 1);
        }).map(it => {
            if (it === '-') return 'separator';
            if (isString(it)) return it;

            const required = it.recordsRequired,
                requiredRecordsNotMet = (isBoolean(required) && required && count === 0) ||
                    (isNumber(required) && count !== required);

            let icon = it.icon;
            if (isValidElement(icon)) {
                icon = convertIconToSvg(icon);
            }

            return {
                name: it.text,
                icon,
                disabled: (it.disabled || requiredRecordsNotMet),
                action: () => it.action(it, rec, selModel)
            };
        });
    }

    sortByGroup(nodeA, nodeB) {
        if (nodeA.key < nodeB.key) {
            return -1;
        } else if (nodeA.key > nodeB.key) {
            return 1;
        } else {
            return 0;
        }
    }

    //------------------------
    // Reactions to model
    //------------------------
    dataReaction() {
        const {model} = this;
        return {
            track: () => [model.agApi, model.store.records],
            run: ([api, records]) => {
                if (api) {
                    runInAction(() => {
                        // Load updated data into the grid.
                        api.setRowData(records);

                        // Size columns to account for scrollbar show/hide due to row count change.
                        api.sizeColumnsToFit();

                        // Force grid to fully re-render cells. We are *not* relying on its default
                        // cell-level change detection as this does not account for our current
                        // renderer API (where renderers can reference other properties on the data
                        // object). See https://github.com/exhi/hoist-react/issues/550.
                        api.refreshCells({force: true});

                        // Increment version counter to trigger selectionReaction w/latest data.
                        this._dataVersion++;
                    });
                }
            }
        };
    }

    selectionReaction() {
        const {model} = this;
        return {
            track: () => [model.agApi, model.selection, this._dataVersion],
            run: ([api]) => {
                if (!api) return;

                const modelSelection = model.selModel.ids,
                    gridSelection = api.getSelectedRows().map(it => it.id),
                    diff = xor(modelSelection, gridSelection);

                // If ag-grid's selection differs from the selection model, set it to match.
                if (diff.length > 0) {
                    api.deselectAll();
                    modelSelection.forEach(id => {
                        const node = api.getRowNode(id);
                        if (node) node.setSelected(true);
                    });
                }
            }
        };
    }

    sortReaction() {
        return {
            track: () => [this.model.agApi, this.model.sortBy],
            run: ([api, sortBy]) => {
                if (api && !isEqual(api.getSortModel(), sortBy)) {
                    api.setSortModel(sortBy);
                }
            }
        };
    }

    columnsReaction() {
        return {
            track: () => [this.model.agApi, this.model.columns],
            run: ([api, columns]) => {
                if (api) {
                    api.setColumnDefs(this.getColumnDefs());
                    api.sizeColumnsToFit();
                }
            }
        };
    }

    compactReaction() {
        return {
            track: () => [this.model.agApi, this.model.compact],
            run: ([api]) => {
                if (api) api.resetRowHeights();
            }
        };
    }

    //------------------------
    // Event Handlers on AG Grid.
    //------------------------
    onGridReady = (ev) => {
        this.model.setAgApi(ev.api);
    }

    onNavigateToNextCell = (params) => {
        return navigateSelection(params, this.model.agApi);
    }

    onSelectionChanged = (ev) => {
        this.model.selModel.select(ev.api.getSelectedRows());
    }

    onSortChanged = (ev) => {
        this.model.setSortBy(ev.api.getSortModel());
    }

    onDragStopped = (ev) => {
        this.model.noteAgColumnStateChanged(ev.columnApi.getColumnState());
    }

    onGridSizeChanged = (ev) => {
        if (this.isDisplayed) {
            ev.api.sizeColumnsToFit();
        }
    }
}
export const grid = elemFactory(Grid);
