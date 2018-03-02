/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from 'hoist/core';
import {observable, action} from 'hoist/mobx';
import {LastPromiseModel} from 'hoist/promise';

import {GridSelectionModel} from './GridSelectionModel';

/**
 * Core Model for a Grid.
 */
export class GridModel {

    // Immutable public properties
    store = null;
    selection = new GridSelectionModel();
    loadModel = new LastPromiseModel();

    @observable columns = [];
    @observable store = null;

    /**
     * Construct this object.
     */
    constructor({store, columns}) {
        this.store = store;
        this.columns = columns;
    }
}