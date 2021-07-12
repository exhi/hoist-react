/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {XH} from '@xh/hoist/core';
import {RecordAction} from '@xh/hoist/data';
import {Icon} from '@xh/hoist/icon';
import copy from 'clipboard-copy';
import {flatten, isEmpty, isString} from 'lodash';

/**
 * Model for ContextMenus interacting with data provided by Hoist data stores, typically via a Grid.
 * @see GridModel.contextMenu
 */
export class StoreContextMenu {

    /** @member {RecordAction[]} */
    items = [];
    /** @member {GridModel} */
    gridModel = null;

    /**
     * @param {Object} c - StoreContextMenu configuration.
     * @param {(RecordAction[]|Object[]|string[])} c.items - RecordActions/configs or string
     *     tokens.
     *      If a String, value can be '-' for a separator, a Hoist token (below),
     *      or a token supported by ag-Grid for its native menu items.
     *      Hoist tokens, all of which require a GridModel:
     *          `copyCell` - copy cell value to clipboard.
     *          `colChooser` - display column chooser for a grid.
     *          `expandCollapseAll` - expand/collapse all parent rows on grouped or tree grid.
     *          `export` - export grid data to excel via Hoist's server-side export capabilities.
     *          `exportExcel` - alias for `export`.
     *          `exportCsv` - export to CSV via Hoist's server-side export capabilities.
     *          `exportLocal` - export to Excel via ag-Grid's built-in client side export.
     *          `autosizeColumns` - autosize columns to fit their contents.
     *          `restoreDefaults` - restore column, sorting, and grouping configs and clear any
     *              persistent grid state. {@see GridModel.restoreDefaults}
     * @param {GridModel} [c.gridModel] - GridModel to bind to this contextMenu, used to enable
     *      implementation of menu items / tokens above.
     * @link https://www.ag-grid.com/javascript-grid-context-menu/#built-in-menu-items
     */
    constructor({items, gridModel}) {
        this.gridModel = gridModel;
        this.items = flatten(items.map(it => this.buildRecordAction(it)));
    }

    buildRecordAction(item) {
        if (isString(item)) return this.parseToken(item);

        const ret = (item instanceof RecordAction) ? item : new RecordAction(item);
        if (!isEmpty(ret.items)) {
            ret.items = ret.items.map(it => this.buildRecordAction(it));
        }
        return ret;
    }

    parseToken(token) {
        const {gridModel} = this;

        // Export tokens are currently only supported on desktop devices.
        if (!XH.isDesktop && token.startsWith('export')) return;

        if (token === 'autoSizeColumns') {
            console.warn('StoreContextMenu token `autoSizeColumns` has been deprecated. Use `autosizeColumns` instead.');
            token = 'autosizeColumns';
        }

        switch (token) {
            case 'copyCell':
                return new RecordAction({
                    text: 'Copy Cell',
                    icon: Icon.copy(),
                    hidden: !gridModel,
                    recordsRequired: true,
                    actionFn: ({record, column}) => {
                        if (record && column) {
                            const value = column.getValueFn({
                                record,
                                column,
                                field: column.field,
                                store: record.store,
                                gridModel
                            });

                            copy(value);
                        }
                    }
                });
            case 'colChooser':
                return new RecordAction({
                    text: 'Columns...',
                    icon: Icon.gridPanel(),
                    hidden: !gridModel?.colChooserModel,
                    actionFn: () => gridModel.colChooserModel.open()
                });
            case 'export':
            case 'exportExcel':
                return new RecordAction({
                    text: 'Export to Excel',
                    icon: Icon.fileExcel(),
                    hidden: !gridModel?.enableExport,
                    disabled: !gridModel?.store.count,
                    actionFn: () => gridModel.exportAsync({type: 'excelTable'})
                });
            case 'exportCsv':
                return new RecordAction({
                    text: 'Export to CSV',
                    icon: Icon.file(),
                    hidden: !gridModel?.enableExport,
                    disabled: !gridModel?.store.count,
                    actionFn: () => gridModel.exportAsync({type: 'csv'})
                });
            case 'expandCollapseAll':
                return [
                    new RecordAction({
                        text: 'Expand All',
                        icon: Icon.angleDown(),
                        hidden: !gridModel || (!gridModel.treeMode && isEmpty(gridModel.groupBy)),
                        actionFn: () => gridModel.expandAll()
                    }),
                    new RecordAction({
                        text: 'Collapse All',
                        icon: Icon.angleRight(),
                        hidden: !gridModel || (!gridModel.treeMode && isEmpty(gridModel.groupBy)),
                        actionFn: () => gridModel.collapseAll()
                    })
                ];
            case 'exportLocal':
                return 'export';
            case 'autosizeColumns':
                return new RecordAction({
                    text: 'Autosize Columns',
                    icon: Icon.arrowsLeftRight(),
                    hidden: !gridModel?.autosizeEnabled,
                    actionFn: () => gridModel.autosizeAsync()
                });
            case 'restoreDefaults':
                return new RecordAction({
                    text: 'Restore Grid Defaults',
                    icon: Icon.reset(),
                    actionFn: () => gridModel.restoreDefaultsAsync()
                });
            case 'gridFilter':
                return new RecordAction({
                    text: 'View Filters',
                    icon: Icon.code(),
                    hidden: !gridModel || !gridModel.filterModel,
                    actionFn: () => gridModel.filterModel.openDialog()
                });
            default:
                return token;
        }
    }
}
