/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */

import {HoistModel} from '@xh/hoist/core';
import {action, computed, observable, makeObservable, comparer} from '@xh/hoist/mobx';
import {castArray, compact, remove, isEqual, union} from 'lodash';

/**
 * Model for managing store selections.
 * Typically accessed from a GridModel to observe/control Grid selection.
 */
export class StoreSelectionModel extends HoistModel {

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
        super();
        makeObservable(this);
        this.store = store;
        this.mode = mode;
        this.addReaction(this.cullSelectionReaction());
    }

    /** @return {Record[]} - currently selected Records. */
    @computed({equals: comparer.shallow})
    get records() {
        return compact(this.ids.map(it => this.store.getById(it)));
    }

    /** @return {?Record} - single selected record, or null if multiple or no records selected. */
    get singleRecord() {
        const {records} = this;
        return records.length === 1 ? records[0] : null;
    }

    /** @return {boolean} - true if selection is empty. */
    get isEmpty() {
        return this.count === 0;
    }

    /** @return {number} - count of currently selected records. */
    get count() {
        return this.records.length;
    }

    /**
     * Set the selection.
     * @param {(Object[]|Object)} records - single record/ID or array of records/IDs to select.
     * @param {boolean} [clearSelection] - true to clear previous selection (rather than add to it).
     */
    @action
    select(records, clearSelection = true) {
        records = castArray(records ?? []);
        if (this.mode === 'disabled') return;
        if (this.mode === 'single' && records.length > 1) {
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
        // Just cleanup and not mutating the ref.  The records @computed provides all observable state
        const {store} = this;
        return {
            track: () => store.records,
            run: () => remove(this.ids, id => !store.getById(id))
        };
    }
}

