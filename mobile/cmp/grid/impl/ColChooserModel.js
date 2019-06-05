/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {observable, settable, bindable, computed, action} from '@xh/hoist/mobx';
import {warnIf} from '@xh/hoist/utils/js';
import {sortBy, clone, find} from 'lodash';

/**
 * State management for the ColChooser component.
 *
 * It is not necessary to manually create instances of this class within an application.
 * @private
 */
@HoistModel
export class ColChooserModel {

    gridModel = null;

    @settable @observable.ref columns = [];
    @bindable pinFirst;

    @observable isOpen = false;
    @observable enablePinFirstRow = true;

    @computed
    get visibleColumns() {
        return this.getVisible(this.columns);
    }

    @computed
    get hiddenColumns() {
        return sortBy(this.getHidden(this.columns), 'text');
    }

    /**
     * @param {GridModel} gridModel - model for the grid to be managed.
     */
    constructor(gridModel) {
        this.gridModel = gridModel;
        this.addReaction({
            track: () => this.pinFirst,
            run: this.updatePinnedColumn
        });
        this.addReaction({
            track: () => XH.routerState,
            run: this.close
        });
    }

    restoreDefaults() {
        this.gridModel.stateModel.resetStateAsync().then(() => {
            this.syncChooserData();
        });
    }

    @action
    open({enablePinFirstRow}) {
        this.syncChooserData();
        this.isOpen = true;
        this.enablePinFirstRow = enablePinFirstRow;
    }

    @action
    close() {
        this.isOpen = false;
    }

    updatePinnedColumn() {
        const columns = [...this.columns];

        // Loop through and, if applicable, pin the first
        // non-excluded visible column encountered
        let shouldPinFirst = this.pinFirst;
        columns.forEach(it => {
            if (it.exclude) return;
            if (!it.hidden && shouldPinFirst) {
                it.pinned = 'left';
                shouldPinFirst = false;
            } else {
                it.pinned = false;
            }
        });

        this.setColumns(columns);
    }

    onHideBtnClick(colId, hide) {
        // When moving between lists, update idx to appear at the end of the destination sublist
        let toIdx = this.visibleColumns.length;
        if (hide) toIdx += this.hiddenColumns.length;

        this.moveToIndex(colId, toIdx);
        this.setHidden(colId, hide);
        this.updatePinnedColumn();
    }

    setHidden(colId, hidden) {
        const columns = clone(this.columns),
            col = find(columns, {colId});

        if (!col || col.locked || col.exclude) return;

        col.hidden = hidden;
        this.setColumns(columns);
    }

    moveToIndex(colId, toIdx) {
        const columns = clone(this.columns),
            col = find(columns, {colId});

        if (!col || col.exclude) return;

        const fromIdx = columns.indexOf(col);
        columns.splice(toIdx, 0, columns.splice(fromIdx, 1)[0]);
        this.setColumns(columns);
    }

    commit() {
        // Ensure excluded columns remain at their original sort idx
        const excluded = this.columns.filter(it => it.exclude);
        excluded.forEach(it => {
            const {colId, originalIdx} = it;
            this.moveToIndex(colId, originalIdx);
        });

        // Extract meaningful state changes
        const colChanges = this.columns.map(it => {
            const {colId, hidden, pinned} = it;
            return {colId, hidden, pinned};
        });

        this.gridModel.applyColumnStateChanges(colChanges);
    }

    //------------------------
    // Implementation
    //------------------------
    syncChooserData() {
        const {gridModel} = this,
            cols = gridModel.getLeafColumns();

        const columns = gridModel.columnState.map(({colId}, idx) => {
            const col = gridModel.findColumn(cols, colId),
                visible = gridModel.isColumnVisible(colId),
                pinned = gridModel.getColumnPinned(colId);

            warnIf(pinned && idx > 0, 'ColChooser only supports pinning the first column. Subsequent pinned columns will be ignored.');

            return {
                originalIdx: idx,
                colId: col.colId,
                text: col.chooserName,
                hidden: !visible,
                exclude: col.excludeFromChooser,
                locked: visible && !col.hideable,
                pinned: pinned && idx === 0
            };
        });

        this.setColumns([
            ...this.getVisible(columns),
            ...this.getHidden(columns)
        ]);

        this.setPinFirst(columns.length && columns[0].pinned);
    }

    getVisible(cols) {
        return cols.filter(it => !it.hidden);
    }

    getHidden(cols) {
        return cols.filter(it => it.hidden);
    }
}
