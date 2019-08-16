/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {observable, action} from '@xh/hoist/mobx';
import {RecordSet} from './impl/RecordSet';
import {Field} from './Field';
import {isString, isEmpty, isFunction, isPlainObject, remove} from 'lodash';
import {throwIf} from '@xh/hoist/utils/js';
import {Record} from './Record';
import {StoreFilter} from './StoreFilter';

/**
 * A managed and observable set of local, in-memory records.
 */
export class Store {

    /** @member {Field[]} */
    fields = null;
    /** @member {(function|string)} */
    idSpec;
    /** @member {function} */
    processRawData;

    /** @member {number} - timestamp (ms) of the last time this store's data was changed */
    @observable lastUpdated;

    /** @member {number} - timestamp (ms) of the last time this store's data was loaded.*/
    @observable lastLoaded;

    /** @member {Record} - record containing summary data. */
    @observable.ref summaryRecord = null;

    @observable.ref _all;
    @observable.ref _filtered;
    _filter = null;
    _loadRootAsSummary = false;

    /**
     * @param {Object} c - Store configuration.
     * @param {(string[]|Object[]|Field[])} c.fields - Fields, Field names, or Field config objects.
     * @param {(function|string)} [c.idSpec] - specification for selecting or producing an immutable
     *      unique id for each record. May be either a property (default is 'id') or a function to
     *      create an id from a record. If there is no natural id to select/generate, you can use
     *      `XH.genId` to generate a unique id on the fly. NOTE that in this case, grids and other
     *      components bound to this store will not be able to maintain record state across reloads.
     * @param {function} [c.processRawData] - function to run on each individual data object
     *      presented to loadData() prior to creating a record from that object.  This function should
     *      return a data object, taking care to clone the original object if edits are necessary.
     * @param {(StoreFilter|Object|function)} [c.filter] - initial filter for records, or specification for creating one.
     * @param {boolean} [c.loadRootAsSummary] - true to treat the root node in hierarchical data as
     *      the summary record.
     */
    constructor(
        {
            fields,
            idSpec = 'id',
            processRawData = null,
            filter = null,
            loadRootAsSummary = false
        }) {
        this.fields = this.parseFields(fields);
        this._filtered = this._all = new RecordSet(this);
        this.setFilter(filter);
        this.idSpec = idSpec;
        this.processRawData = processRawData;
        this.lastLoaded = this.lastUpdated = Date.now();
        this._loadRootAsSummary = loadRootAsSummary;
    }

    /**
     * Load new data into this store, replacing any/all pre-existing records.
     *
     * If raw data objects have a `children` property it will be expected to be an array
     * and its items will be recursively processed into child records.
     *
     * Note that this process will re-use pre-existing Records if they are present in the new
     * dataset (as identified by their ID), contain the same data, and occupy the same place in any
     * hierarchy across old and new loads.
     *
     * This is to maximize the ability of downstream consumers (e.g. ag-Grid) to recognize Records
     * that have not changed and do not need to be re-evaluated / re-rendered.
     *
     * Summary data can be provided via `rawSummaryData` or as the root data if the Store was
     * created with the loadRootAsSummary flag set to true.
     *
     * @param {Object[]} rawData
     * @param {Object} [rawSummaryData]
     */
    @action
    loadData(rawData, rawSummaryData) {

        // Peel off rootSummary if needed
        if (this._loadRootAsSummary) {
            throwIf(
                rawData.length != 1 || isEmpty(rawData[0].children) || rawSummaryData,
                'Incorrect call to loadData with loadRootAsSummary=true.  Summary Data should be in a single root node.'
            );
            rawSummaryData = rawData[0];
            rawData = rawData[0].children;
        }

        this._all = this._all.loadRecords(this.createRecords(rawData, null));
        this.rebuildFiltered();
        this.setSummaryRecordInternal(rawSummaryData ? this.createRecord(rawSummaryData) : null);
        this.lastLoaded = this.lastUpdated = Date.now();
    }

    /**
     * Add, update, or delete records in this store.
     *
     * @param {StoreUpdate} changes
     */
    @action
    updateData(changes) {
        const {updates, adds, deletes, rawSummaryData} = changes;

        // 1) Pre-process updates, adds into Records
        let updateRecs, addRecs;
        if (updates) {
            updateRecs = updates.map(it => this.createRecord(it));
        }
        if (adds) {
            addRecs = new Map();
            adds.forEach(it => this.createRecords([it.rawData], it.parentId, addRecs));
        }

        // 2) Pre-process summary record, peeling it out of updates if needed
        let {summaryRecord} = this,
            summaryUpdateRec;
        if (summaryRecord) {
            [summaryUpdateRec] = remove(updateRecs, {id: summaryRecord.id});
            if (!summaryUpdateRec && rawSummaryData) {
                summaryUpdateRec = this.createRecord(rawSummaryData);
            }
        }

        // 3) Apply changes
        let didUpdate = false;
        if (!isEmpty(updateRecs) || (addRecs && addRecs.size) || !isEmpty(deletes)) {
            this._all = this._all.updateData({updates: updateRecs,  adds: addRecs, deletes: deletes});
            this.rebuildFiltered();
            didUpdate = true;
        }

        if (summaryUpdateRec) {
            this.setSummaryRecordInternal(summaryUpdateRec);
            didUpdate = true;
        }

        if (didUpdate) this.lastUpdated = Date.now();
    }

    /** Remove all records from the store. */
    clear() {
        this.loadData([], null);
    }

    /**
     * Call if/when any records have had their data modified directly, outside of this store's load
     * and update APIs.
     *
     * If the structure of the data has changed (e.g. deletion, additions, re-parenting of children)
     * loadData() should be called instead.
     */
    @action
    noteDataUpdated() {
        this.rebuildFiltered();
        this.lastUpdated = Date.now();
    }

    /**
     * Get a specific field, by name.
     * @param {string} name - field name to locate.
     * @return {Field}
     */
    getField(name) {
        return this.fields.find(it => it.name === name);
    }

    /**
     * Records in this store, respecting any filter (if applied).
     * @return {Record[]}
     */
    get records() {
        return this._filtered.list;
    }

    /**
     * All records in this store, unfiltered.
     * @return {Record[]}
     */
    get allRecords() {
        return this._all.list;
    }

    /**
     * Root records in this store, respecting any filter (if applied).
     * If this store is not hierarchical, this will be identical to 'records'.
     *
     * @return {Record[]}
     */
    get rootRecords() {
        return this._filtered.rootList;
    }

    /**
     * Root records in this store, unfiltered.
     * If this store is not hierarchical, this will be identical to 'allRecords'.
     *
     * @return {Record[]}
     */
    get allRootRecords() {
        return this._all.rootList;
    }

    /**
     * Set filter to be applied.
     * @param {(StoreFilter|Object|function)} filter - StoreFilter to be applied to records, or
     *      config or function to be used to create one.
     */
    setFilter(filter) {
        if (isFunction(filter)) {
            filter = new StoreFilter({fn: filter});
        } else if (isPlainObject(filter)) {
            filter = new StoreFilter(filter);
        }

        this._filter = filter;
        this.rebuildFiltered();
    }

    /** @returns {StoreFilter} - the current filter (if any) applied to the store. */
    get filter() {return this._filter}

    /** Get the count of all records loaded into the store. */
    get allCount() {
        return this._all.count;
    }

    /** Get the count of the filtered records in the store. */
    get count() {
        return this._filtered.count;
    }

    /** Get the count of the filtered root records in the store. */
    get rootCount() {
        return this._filtered.rootCount;
    }

    /** Get the count of all root records in the store. */
    get allRootCount() {
        return this._all.rootCount;
    }

    /** Is the store empty after filters have been applied? */
    get empty() {return this.count === 0}

    /** Is this store empty before filters have been applied? */
    get allEmpty() {return this.allCount === 0}

    /**
     * Get a record by ID, or null if no matching record found.
     *
     * @param {(string|number)} id
     * @param {boolean} [fromFiltered] - true to skip records excluded by any active filter.
     * @return {Record}
     */
    getById(id, fromFiltered = false) {
        const rs = fromFiltered ? this._filtered : this._all;
        return rs.records.get(id);
    }

    /**
     * Get children records for a record.
     *
     * See also the 'children' and 'allChildren' properties on Record - those getters will likely
     * be more convenient for most app-level callers.
     *
     * @param {(string|number)} id - id of record to be queried.
     * @param {boolean} [fromFiltered] - true to skip records excluded by any active filter.
     * @return {Record[]}
     */
    getChildrenById(id, fromFiltered = false) {
        const rs = fromFiltered ? this._filtered : this._all,
            ret = rs.childrenMap.get(id);
        return ret ? ret : [];
    }

    /** Destroy this store, cleaning up any resources used. */
    destroy() {}

    //--------------------
    // For Implementations
    //--------------------
    get defaultFieldClass() {
        return Field;
    }

    //------------------------
    // Private Implementation
    //------------------------
    @action
    rebuildFiltered() {
        this._filtered = this._all.applyFilter(this.filter);
    }

    parseFields(fields) {
        const ret = fields.map(f => {
            if (f instanceof Field) return f;
            if (isString(f)) f = {name: f};
            return new this.defaultFieldClass(f);
        });

        throwIf(
            ret.some(it => it.name == 'id'),
            `Applications should not specify a field for the id of a record.  An id property is created 
            automatically for all records. See Store.idSpec for more info.`
        );
        return ret;
    }

    setSummaryRecordInternal(record) {
        if (record) {
            record.xhIsSummary = true;
        }
        this.summaryRecord = record;
    }

    //---------------------------------------
    // Record Generation
    //---------------------------------------
    createRecord(raw, parentId) {
        const {processRawData} = this;

        let data = raw;
        if (processRawData) {
            data = processRawData(raw);
            throwIf(!data, 'processRawData should return an object. If writing/editing, be sure to return a clone!');
        }

        return new Record({data, raw, parentId, store: this});
    }

    createRecords(rawRecs, parentId, records = new Map()) {
        rawRecs.forEach(raw => {
            const rec = this.createRecord(raw, parentId),
                {id} = rec;
            throwIf(
                records.has(id),
                `ID ${id} is not unique. Use the 'Store.idSpec' config to resolve a unique ID for each record.`
            );

            records.set(id, rec);

            if (raw.children) {
                this.createRecords(raw.children, id, records);
            }
        });
        return records;
    }
}

/**
 * @typedef StoreUpdate
 * @property {Object[]} updates - list of raw data objects representing records to be updated. The
 *      form of these records should be the same as presented to loadData(), with the exception that
 *      the children property will be ignored, and the existing children for the record in question will be preserved.
 * @property {Object[]} adds - list of raw data representing records to be added, with the parent node
 *      where they should be added, if not at the root.  Each item should be of the form
 *      {parentId: id , rawData: {}}.  The form of the rawData objects should be the same as presented to loadData()
 * @property {string[]} deletes - list of ids representing records to be removed.
 * @property {Object} rawSummaryData - update to the dedicated summary row for this store. If Store.loadRootAsSummary,
 *      this may alternatively be specified in the updates collection.
 */
