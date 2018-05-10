/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {HoistModel} from 'hoist/core';
import {observable} from 'hoist/mobx';

/**
 * Core Model for a Grid, specifying the grid's data store and column definitions
 */
@HoistModel()
export class GridModel {

    // Immutable public properties
    store = null;
    handler = null;
    @observable leftColumn = null;
    @observable rightColumn = null;

    /**
     * @param {BaseStore} store - store containing the data for the grid.
     * @param {Object} leftColumn - column specification to show in left side of grid
     * @param {Object} rightColumn - column specification to show in right side of grid
     * @param {Function} [handler] - function to trigger on item tap. Receives record as argument.
     */
    constructor({
        store,
        leftColumn,
        rightColumn,
        handler
    }) {
        this.store = store;
        this.leftColumn = leftColumn;
        this.rightColumn = rightColumn;
        this.handler = handler;
    }

    /** Load the underlying store. */
    loadAsync(...args) {
        return this.store.loadAsync(...args);
    }

    /** Load the underlying store. */
    loadData(...args) {
        return this.store.loadData(...args);
    }

}