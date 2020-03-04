/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {cloneDeep, debounce, find, remove, isUndefined, omit} from 'lodash';
import {start} from '@xh/hoist/promise';

/**
 * Model for serializing/de-serializing saved grid state across user browsing sessions
 * and applying saved state to its parent GridModel upon that model's construction.
 *
 * GridModels can enable persistent grid state via their stateModel config, typically
 * provided as a simple string `gridId` to identify a given grid instance.
 *
 * It is not necessary to manually create instances of this class within an application.
 * @private
 */
@HoistModel
export class GridStateModel {

    /**
     * Version of grid state definitions currently supported by this model.
     * Increment *only* when we need to abandon all existing grid state that might be saved on
     * user workstations to ensure compatibility with a new serialization or approach.
     */
    static GRID_STATE_VERSION = 1;
    static STATE_SAVE_DEBOUNCE_MS = 500;

    gridModel = null;
    gridId = null;

    state = {};
    defaultState = null;

    /**
     * @param {Object} c - GridStateModel configuration.
     * @param {string} c.gridId - unique identifier for a Grid instance.
     * @param {boolean} [c.trackColumns] - true to save state of columns,
     *      including visibility, ordering and pixel widths.
     * @param {boolean} [c.trackSort] - true to save sorting.
     * @param {boolean} [c.trackGrouping] - true to save column grouping.
     */
    constructor({gridId, trackColumns = true, trackSort = true, trackGrouping = true}) {
        this.gridId = gridId;
        this.trackColumns = trackColumns;
        this.trackSort = trackSort;
        this.trackGrouping = trackGrouping;
    }

    init(gridModel) {
        this.gridModel = gridModel;

        if (this.trackColumns) {
            this.addReaction(this.columnReaction());
        }

        if (this.trackSort) {
            this.addReaction(this.sortReaction());
        }

        if (this.trackGrouping) {
            this.addReaction(this.groupReaction());
        }

        this.initializeState();
    }

    getStateKey() {
        return `gridState.v${GridStateModel.GRID_STATE_VERSION}.${this.gridId}`;
    }

    readState(stateKey) {
        return XH.localStorageService.get(stateKey, {});
    }

    saveState(stateKey, state) {
        XH.localStorageService.set(stateKey, state);
    }

    resetState(stateKey) {
        XH.localStorageService.remove(stateKey);
    }

    resetStateAsync() {
        return start(() => {
            this.loadState(this.defaultState);
            this.resetState(this.getStateKey());
        });
    }

    //--------------------------
    // Implementation
    //--------------------------
    initializeState() {
        const userState = this.readState(this.getStateKey());
        this.defaultState = this.readStateFromGrid();

        this.loadState(userState);
    }

    readStateFromGrid() {
        const {gridModel} = this;
        return {
            columns: gridModel.columnState,
            sortBy: gridModel.sortBy,
            groupBy: gridModel.groupBy
        };
    }

    loadState(state) {
        this.state = cloneDeep(state);
        if (this.trackColumns) this.updateGridColumns();
        if (this.trackGrouping) this.updateGridGroupBy();
        if (this.trackSort) this.updateGridSort();
    }

    //--------------------------
    // Columns
    //--------------------------
    columnReaction() {
        return {
            track: () => this.gridModel.columnState,
            run: (columnState) => {
                this.state.columns = this.removeWidthOfResizable(columnState);
                this.saveStateChange();
            }
        };
    }

    updateGridColumns() {
        const {gridModel, state, trackColumns} = this;
        if (!trackColumns || !state.columns) return;

        let colState = this.cleanColumnState(state.columns);

        gridModel.applyColumnStateChanges(colState);
    }

    //--------------------------
    // Sort
    //--------------------------
    sortReaction() {
        const {gridModel} = this;
        return {
            track: () => gridModel.sortBy,
            run: () => {
                this.state.sortBy = gridModel.sortBy.map(it => it.toString());
                this.saveStateChange();
            }
        };
    }

    updateGridSort() {
        const {sortBy} = this.state;
        if (this.trackSort && !isUndefined(sortBy)) this.gridModel.setSortBy(sortBy);
    }

    //--------------------------
    // Grouping
    //--------------------------
    groupReaction() {
        return {
            track: () => this.gridModel.groupBy,
            run: (groupBy) => {
                this.state.groupBy = groupBy;
                this.saveStateChange();
            }
        };
    }

    updateGridGroupBy() {
        const {groupBy} = this.state;
        if (this.trackGrouping && !isUndefined(groupBy)) this.gridModel.setGroupBy(groupBy);
    }

    //--------------------------
    // Helpers
    //--------------------------
    saveStateChange = debounce(() => {
        this.saveState(this.getStateKey(), this.state);
    }, GridStateModel.STATE_SAVE_DEBOUNCE_MS);

    cleanColumnState(columnState) {
        const {gridModel} = this;
        const cols = gridModel.getLeafColumns();

        let cleanedState = [...columnState];

        // Remove any columns which are saved in state but not found in the grid
        remove(cleanedState, ({colId}) => !gridModel.findColumn(cols, colId));

        // Any grid columns that were not found in state are newly added to the code.
        // Insert these columns in position based on the index at which they are defined.
        cols.forEach(({colId}, idx) => {
            if (!find(cleanedState, {colId})) {
                cleanedState.splice(idx, 0, {colId});
            }
        });

        // Remove the width from any non-resizable column
        cleanedState = cleanedState.map(state => {
            const col = this.gridModel.findColumn(cols, state.colId);
            return col.resizable ? state : omit(state, 'width');
        });

        return cleanedState;
    }
}