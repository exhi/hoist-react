/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {HoistModel} from '@xh/hoist/core';
import {action, computed, observable} from '@xh/hoist/mobx';
import {castArray, intersection, isEqual, union} from 'lodash';

/**
 * Model for managing store selections.
 * Typically accessed from a GridModel to observe/control Grid selection.
 */
@HoistModel
export class StoreSelectionModel {

    /** @member {Store} */
    store;
    /** @member {string} */
    mode;

    @observable.ref ids = [];

    /**
     * @param {Object} c - StoreSelectionModel configuration.
     * @param {Store} c.store - Store containing the data.
     * @param {string} [c.mode] - one of ['single', 'multiple', 'disabled'].
     */
    constructor({store, mode = 'single'}) {
        this.store = store;
        this.mode = mode;
        this.addReaction(this.cullSelectionReaction());
    }

    /** Single selected record, or null if multiple or no records selected. */
    @computed
    get singleRecord() {
        const ids = this.ids;
        return ids.length === 1 ? this.store.getById(ids[0]) : null;
    }

    /** Currently selected records. */
    @computed
    get records() {
        return this.ids.map(it => this.store.getById(it));
    }

    /** Is the selection empty? */
    @computed
    get isEmpty() {
        return this.ids.length === 0;
    }

    /** Number of currently selected records. */
    @computed
    get count() {
        return this.ids.length;
    }

    /**
     * Set the selection.
     * @param {(Object[]|Object)} records - single record/ID or array of records/IDs to select.
     * @param {boolean} [clearSelection] - true to clear previous selection (rather than add to it).
     */
    @action
    select(records, clearSelection = true) {
        records = castArray(records);
        if (this.mode == 'disabled') return;
        if (this.mode == 'single' && records.length > 1) {
            records = [records[0]];
        }
        const ids = records.map(it => {
            return it.id != null ? it.id : it;
        }).filter(id => {
            return this.store.getById(id, true);
        });

        if (isEqual(ids, this.ids)) {
            return;
        }

        this.ids = clearSelection ? ids : union(this.ids, ids);
    }

    /** Select all filtered records. */
    @action
    selectAll() {
        if (this.mode === 'multiple') {
            this.select(this.store.records);
        }
    }


    /** Clear the selection. */
    @action
    clear() {
        this.select([]);
    }

    //------------------------
    // Implementation
    //------------------------
    cullSelectionReaction() {
        // Remove recs from selection if they are no longer in store e.g. (due to filtering)
        return {
            track: () => this.store.records,
            run: (records) => {
                const storeIds = records.map(it => it.id),
                    selection = this.ids,
                    newSelection = intersection(storeIds, selection);
                if (selection.length !== newSelection.length) {
                    this.select(newSelection);
                }
            }
        };
    }
}

