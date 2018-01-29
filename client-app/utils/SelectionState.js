/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {setter, observable, computed} from 'hoist/mobx';

/**
 * Tracks the selection in a GridPanel.
 */
export class SelectionState {

    @setter @observable selection = [];

    @computed get firstRow() {
        return this.selection[0];
    }
}