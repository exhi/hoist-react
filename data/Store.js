/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';
import {
    castArray,
    differenceBy,
    has,
    isArray,
    isEmpty,
    isEqual,
    isFunction,
    isPlainObject,
    isString,
    keys,
    pick,
    remove as lodashRemove
} from 'lodash';
import {warnIf, withDefault} from '../utils/js';
import {Field} from './Field';
import {RecordSet} from './impl/RecordSet';
import {Record} from './Record';
import {StoreFilter} from './StoreFilter';

/**
 * A managed and observable set of local, in-memory records.
 */
export class Store {

    /** @member {Field[]} */
    fields = null;
    /** @member {function} */
    idSpec;
    /** @member {function} */
    processRawData;

    /** @member {number} - timestamp (ms) of the last time this store's data was changed */
    @observable lastUpdated;

    /** @member {number} - timestamp (ms) of the last time this store's data was loaded.*/
    @observable lastLoaded;

    /** @member {Record} - record containing summary data. */
    @observable.ref summaryRecord = null;

    @observable.ref _original;
    @observable.ref _current;
    @observable.ref _filtered;
    _filter = null;
    _loadRootAsSummary = false;

    /**
     * @param {Object} c - Store configuration.
     * @param {(string[]|Object[]|Field[])} c.fields - Fields, Field names, or Field config objects.
     * @param {(function|string)} [c.idSpec] - specification for selecting or producing an immutable
     *      unique id for each record. May be either a string property name (default is 'id') or a
     *      function to create an id from a record. Will be normalized to a function upon Store
     *      construction. If there is no natural id to select/generate, you can use `XH.genId` to
     *      generate a unique id on the fly. NOTE that in this case, grids and other components
     *      bound to this store will not be able to maintain record state across reloads.
     * @param {function} [c.processRawData] - function to run on each individual data object
     *      presented to loadData() prior to creating a Record from that object. This function
     *      must return an object, cloning the original object if edits are necessary.
     * @param {(StoreFilter|Object|function)} [c.filter] - initial filter for Records, or a
     *      StoreFilter config to create.
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
        this.idSpec = isString(idSpec) ? (rec) => rec[idSpec] : idSpec;
        this.processRawData = processRawData;
        this.lastLoaded = this.lastUpdated = Date.now();
        this._loadRootAsSummary = loadRootAsSummary;

        this._recordClass = class extends Record {};
        this.fields.forEach(field => {
            Object.defineProperty(this._recordClass.prototype, field.name, {
                get() {return this.data[field.name]},
                set() {throw XH.exception(`Cannot set read-only field '${field.name}' on immutable Record. Use Store.loadDataUpdates() or Store.updateRecord().`)}
            });
        });

        this.resetRecords();
        this.setFilter(filter);
    }

    /** Remove all records from the store. Equivalent to calling `loadData([])`*/
    @action
    clear() {
        this.loadData([]);
    }

    /**
     * Load a new and complete dataset, replacing any/all pre-existing Records as needed.
     *
     * If raw data objects have a `children` property, it will be expected to be an array and its
     * items will be recursively processed into child records, each created with a pointer to its
     * parent's newly assigned Record ID.
     *
     * Note that this process will re-use pre-existing Record object instances if they are present
     * in the new dataset (as identified by their ID), contain the same data, and occupy the same
     * place in any hierarchy across old and new loads.
     *
     * This is to maximize the ability of downstream consumers (e.g. ag-Grid) to recognize Records
     * that have not changed and do not need to be re-evaluated / re-rendered.
     *
     * Summary data can be provided via `rawSummaryData` or as the root data if the Store was
     * created with its `loadRootAsSummary` flag set to true.
     *
     * @param {Object[]} rawData
     * @param {Object} [rawSummaryData]
     */
    @action
    loadData(rawData, rawSummaryData) {
        // Extract rootSummary if loading non-empty data[] (i.e. not clearing) and loadRootAsSummary = true.
        if (rawData.length !== 0 && this._loadRootAsSummary) {
            throwIf(
                rawData.length !== 1 || isEmpty(rawData[0].children) || rawSummaryData,
                'Incorrect call to loadData with loadRootAsSummary=true. Summary data should be in a single root node with top-level row data as its children.'
            );
            rawSummaryData = rawData[0];
            rawData = rawData[0].children;
        }

        const records = this.createRecords(rawData);
        this._original = this._current = this._filtered = this._original.loadRecords(records);
        // TODO: Finalize

        if (rawSummaryData) {
            this.summaryRecord = this.createRecord(rawSummaryData, null, true);
        }

        this.lastLoaded = this.lastUpdated = Date.now();
    }

    /**
     * Add, update, or delete records in this store.
     * @param {Object[]|StoreTransaction} rawData - data changes to process
     */
    @action
    loadDataUpdates(rawData) {
        // Build a transaction object out of a flat list of adds and updates
        if (isArray(rawData)) {
            const add = [], update = [];
            rawData.forEach(it => {
                if (this.getById(it.id)) {
                    update.push(it);
                } else {
                    add.push(it);
                }
            });

            rawData = {add, update};
        }

        const {update, add, remove, rawSummaryData, ...other} = rawData;
        throwIf(!isEmpty(other), 'Unknown argument(s) passed to loadDataUpdates().');

        // 1) Pre-process updates and adds into Records
        let updateRecs, addRecs;
        if (update) {
            updateRecs = update.map(it => this.createRecord(it));
        }
        if (add) {
            addRecs = new Map();
            add.forEach(it => {
                if (it.hasOwnProperty('rawData') && it.hasOwnProperty('parentId')) {
                    const parent = this.getById(it.parentId);
                    warnIf(!parent, `Could not find parent with id '${it.parentId}' when processing record add`);

                    this.createRecords([it.rawData], parent, addRecs);
                } else {
                    this.createRecords([it], null, addRecs);
                }
            });
        }

        let didUpdate = false;

        // 2) Pre-process summary record, peeling it out of updates if needed
        const {summaryRecord} = this;
        let summaryUpdateRec;
        if (summaryRecord) {
            [summaryUpdateRec] = lodashRemove(updateRecs, {id: summaryRecord.id});
        }

        if (!summaryUpdateRec && rawSummaryData) {
            summaryUpdateRec = this.createRecord({...summaryRecord.raw, ...rawSummaryData}, null, true);
        }

        if (summaryUpdateRec) {
            this.summaryRecord = summaryUpdateRec;
            didUpdate = true;
        }

        // 3) Apply changes
        if (!isEmpty(updateRecs) || (addRecs && addRecs.size) || !isEmpty(remove)) {
            const {isDirty} = this;
            this._original = this._original.loadRecordUpdates({update: updateRecs, add: addRecs, remove: remove});

            // If we were dirty before loading the data transaction, we need to also load the transaction
            // into our current state, and then check if we are still dirty or not as the transaction
            // may have put us back into a clean state
            if (isDirty) {
                this._current = this._current.loadRecordUpdates({update: updateRecs, add: addRecs, remove: remove});
                this.normalizeCommittedState();
            } else {
                this._current = this._original;
            }

            this.rebuildFiltered();
            didUpdate = true;
        }

        if (didUpdate) this.lastUpdated = Date.now();
    }

    /**
     * Add new Records to the store. The new Records will be assigned an auto-generated id.
     * @param {Object[]} data - Processed Record data.
     * @param {string|number} [parentId] - id of the parent record to add the new Records under.
     */
    @action
    addRecords(data, parentId) {
        data = castArray(data);
        const addRecs = data.map(it => {
            const id = XH.genId(),
                parsedData = this.parseFieldValues(it),
                parent = this.getById(parentId);

            return new this._recordClass({id, data: parsedData, raw: null, store: this, parent, isSummary: false, originalRecord: null});
        });

        this._current = this._current.loadRecordUpdates({add: addRecs});
        this.onRecordsUpdated();
    }

    /**
     * Add a new Record to the store.
     * @param {Object} [data] - Processed Record data.
     * @param {string|number} [parentId] - id of the parent record to add the new Record under.
     */
    addRecord(data = {}, parentId) {
        this.addRecords([data], parentId);
    }

    /**
     * Remove Records from the store.
     * @param {number[]|string[]|Record[]} records - list of Records or Record ids to remove
     */
    @action
    removeRecords(records) {
        records = castArray(records);
        records = records.map(it => (it instanceof Record) ? it.id : it);

        this._current = this._current.loadRecordUpdates({remove: records});
        this.onRecordsUpdated();

        this.normalizeCommittedState();
    }

    /**
     * Update Record field values.
     * @param {Object[]} data - Processed Record data. Each object in the list is expected to
     *      have an `id` property to use for looking up the Record to update.
     */
    @action
    updateRecords(data) {
        const updateRecs = new Map();

        let hadDupes = false;
        data.forEach(it => {
            // Ignore duplicate entries to avoid extra unnecessary work
            if (updateRecs.has(it.id)) {
                hadDupes = true;
                return;
            }

            const {id, ...data} = it,
                rec = this.getById(id),
                updatedData = this.parseFieldValues(data, true),
                currentData = pick(rec.data, keys(data));

            // Don't bother with an update if the record data hasn't changed
            if (isEqual(updatedData, currentData)) return;

            // If the updated data now matches the original record data, then we can just fall back
            // to the original record
            if (!rec.isNew && isEqual({...rec.data, ...updatedData}, rec.originalRecord?.data)) {
                updateRecs.set(id, rec.originalRecord);
                return;
            }

            const updatedRec = new this._recordClass({
                id: rec.id,
                raw: rec.raw,
                data: Object.assign({}, rec.data, data),
                parent: rec.parent,
                store: rec.store,
                isSummary: rec.xhIsSummary,
                originalRecord: rec.originalRecord
            });


            updateRecs.set(id, updatedRec);
        });

        warnIf(hadDupes, 'Store.updateRecords() called with multiple updates for the same Records. Only the first update entries for each Record were processed.');

        this._current = this._current.loadRecordUpdates({update: Array.from(updateRecs.values())});
        this.onRecordsUpdated();

        this.normalizeCommittedState();
    }

    /**
     * Update field values for a single Record
     * @param {number|string|Record} record - Record or id of the Record to update.
     * @param {Object} data - Processed Record data
     */
    @action
    updateRecord(record, data) {
        const id = (record instanceof Record) ? record.id : record;
        this.updateRecords([{id, ...data}]);
    }

    /**
     * Revert all changes made to the Store since data was last loaded.
     */
    @action
    revert() {
        this._current = this._original;
        this.onRecordsUpdated();
    }

    /**
     * Revert all changes made to the provided records since they were last loaded
     * @param {number[]|string[]|Record[]} records - List of records or Record ids to revert
     */
    @action
    revertRecords(records) {
        records = castArray(records);
        records = records.map(it => (it instanceof Record) ? it : this._current.getById(it));
        this._current = this._current.loadRecordUpdates({update: records.map(it => it.originalRecord)});
        this.onRecordsUpdated();

        this.normalizeCommittedState();
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
        return this._current.list;
    }

    /**
     * All records that were originally loaded into this store.
     * @return {Record[]}
     */
    get originalRecords() {
        return this._original.list;
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
        return this._current.rootList;
    }

    /**
     * Records added to this store which have not been committed.
     * @returns {Record[]}
     */
    get newRecords() {
        return this.records.filter(it => it.isNew);
    }

    /**
     * Records added to this store which have not been committed, unfiltered.
     * @returns {Record[]}
     */
    get allNewRecords() {
        return this.allRecords.filter(it => it.isNew);
    }

    /**
     * Records removed from this store which have not been committed.
     * @returns {Record[]}
     */
    get removedRecords() {
        return differenceBy(this.originalRecords, this.allRecords, 'id');
    }

    /**
     * Records which have been updated since they were last loaded, respecting any filter (if applied).
     * @returns {Record[]}
     */
    get modifiedRecords() {
        return this.records.filter(it => it.isModified);
    }

    /**
     * Records which have been updated since they were last loaded, unfiltered.
     * @returns {Record[]}
     */
    get allModifiedRecords() {
        return this.allRecords.filter(it => it.isModified);
    }

    /**
     * Records which have been added or updated in the store since data was last loaded, respecting
     * any filter (if applied).
     * @returns {Record[]}
     */
    get dirtyRecords() {
        return this.records.filter(it => it.isDirty);
    }

    /**
     * Records which have been added or updated in the store since data was last loaded, unfiltered.
     * @returns {Record[]}
     */
    get allDirtyRecords() {
        return this.allRecords.filter(it => it.isDirty);
    }

    /** @returns {boolean} - true if the store has changes which need to be committed. */
    get isDirty() {
        return this._current !== this._original;
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
    get filter() {
        return this._filter;
    }

    /** @returns {number} - the count of the filtered records in the store. */
    get count() {
        return this._filtered.count;
    }

    /** @returns {number} - the count of all records in the store. */
    get allCount() {
        return this._current.count;
    }

    /** @returns {number} - the count of all records originally loaded into the store. */
    get originalCount() {
        return this._original.count;
    }

    /** @returns {number} - the count of the filtered root records in the store. */
    get rootCount() {
        return this._filtered.rootCount;
    }

    /** @returns {number} - the count of all root records in the store. */
    get allRootCount() {
        return this._current.rootCount;
    }

    /** @returns {number} - the count of all root records originally loaded into the store. */
    get originalRootCount() {
        return this._original.rootCount;
    }

    /** @returns {boolean} - true if the store is empty after filters have been applied */
    get empty() {
        return this._filtered.empty;
    }

    /** @returns {boolean} - true if the store is empty before filters have been applied */
    get allEmpty() {
        return this._current.empty;
    }

    /** @returns {boolean} - true if the store was originally empty */
    get originalEmpty() {
        return this._original.empty;
    }

    /** @returns {RecordSet} - the record set for the current state of the store, filtered */
    get recordSet() {
        return this._filtered;
    }

    /** @returns {RecordSet} - the record set for the current state of the store */
    get currentRecordSet() {
        return this._current;
    }

    /** @returns {RecordSet} - the record set for the original state of the store */
    get originalRecordSet() {
        return this._original;
    }

    /**
     * Get a record by ID, or null if no matching record found.
     *
     * @param {(string|number)} id
     * @param {boolean} [fromFiltered] - true to skip records excluded by any active filter.
     * @return {Record}
     */
    getById(id, fromFiltered = false) {
        if (id === this.summaryRecord?.id) return this.summaryRecord;

        const rs = fromFiltered ? this._filtered : this._current;
        return rs.getById(id);
    }

    /**
     * Get an original record by ID, or null if no matching record found.
     *
     * @param {string|number} id
     * @returns {Record}
     */
    getOriginalById(id) {
        return this._original.getById(id);
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
        const rs = fromFiltered ? this._filtered : this._current,
            ret = rs.childrenMap.get(id);
        return ret ? ret : [];
    }

    /**
     * Get descendant records for a record.
     *
     * See also the 'descendants' and 'allDescendants' properties on Record - those getters will likely
     * be more convenient for most app-level callers.
     *
     * @param {(string|number)} id - id of record to be queried.
     * @param {boolean} [fromFiltered] - true to skip records excluded by any active filter.
     * @return {Record[]}
     */
    getDescendantsById(id, fromFiltered = false) {
        const rs = fromFiltered ? this._filtered : this._current,
            ret = rs.getDescendantsById(id);
        return ret ? ret : [];
    }

    /**
     * Get ancestor records for a record.
     *
     * See also the 'ancestors' and 'allAncestors' properties on Record - those getters will likely
     * be more convenient for most app-level callers.
     *
     * @param {(string|number)} id - id of record to be queried.
     * @param {boolean} [fromFiltered] - true to skip records excluded by any active filter.
     * @return {Record[]}
     */
    getAncestorsById(id, fromFiltered = false) {
        const rs = fromFiltered ? this._filtered : this._current,
            ret = rs.getAncestorsById(id);
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

    resetRecords() {
        this._original = this._current = this._filtered = new RecordSet(this);
        this.summaryRecord = null;
    }

    @action
    rebuildFiltered() {
        this._filtered = this._current.applyFilter(this.filter);
    }

    @action
    onRecordsUpdated() {
        this.rebuildFiltered();
        this.lastUpdated = Date.now();
    }

    @action
    normalizeCommittedState() {
        // If the record sets are equal after loading the transaction, re-set the ref so we
        // know that we are no longer dirty
        if (this._current.isEqual(this._original)) {
            this._current = this._original;
        }
    }

    parseFields(fields) {
        const ret = fields.map(f => {
            if (f instanceof Field) return f;
            if (isString(f)) f = {name: f};
            return new this.defaultFieldClass(f);
        });

        throwIf(
            ret.some(it => it.name == 'id'),
            `Applications should not specify a field for the id of a record. An id property is created
            automatically for all records. See Store.idSpec for more info.`
        );
        return ret;
    }

    //---------------------------------------
    // Record Generation
    //---------------------------------------
    createRecord(raw, parent, isSummary) {
        const {processRawData} = this;

        let data = raw;
        if (processRawData) {
            data = processRawData(raw);
            throwIf(!data, 'processRawData should return an object. If writing/editing, be sure to return a clone!');
        }

        const id = this.idSpec(data),
            rec = this.getById(id);

        // If we are creating a record for update, and the parent id was not provided explicitly, then
        // use the parent id for the record we are updating
        parent = withDefault(parent, rec?.parent);

        data = this.parseFieldValues(data);
        return new this._recordClass({id, data, raw, parent, store: this, isSummary});
    }

    createRecords(rawData, parent, recordMap = new Map()) {
        rawData.forEach(raw => {
            const rec = this.createRecord(raw, parent),
                {id} = rec;

            throwIf(
                recordMap.has(id),
                `ID ${id} is not unique. Use the 'Store.idSpec' config to resolve a unique ID for each record.`
            );

            recordMap.set(id, rec);

            if (raw.children) {
                this.createRecords(raw.children, rec, recordMap);
            }
        });
        return recordMap;
    }

    parseFieldValues(data, skipMissingFields = false) {
        const ret = {};
        this.fields.forEach(field => {
            const {name} = field;

            // Sometimes we want to ignore fields which are not present in the data to preserve
            // an undefined value, to allow merging of data with existing data. In these cases we do
            // not want the configured default value for the field to be used, as we are dealing with
            // a partial data object
            if (skipMissingFields && !has(data, field.name)) return;

            ret[name] = field.parseVal(data[name]);
        });
        return ret;
    }
}

/**
 * @typedef {Object} StoreTransaction - object representing data changes to perform
 *      on a Store's data in a single transaction.
 * @property {Object[]} [update] - list of raw data objects representing records to be updated.
 *      Updates must be matched to existing records by id in order to be applied. The form of the
 *      update objects should be the same as presented to loadData(), with the exception that any
 *      children property will be ignored, and any existing children for the record being updated
 *      will be preserved. If the record is a child, the new updated instance will be assigned to
 *      the same parent. (Meaning: parent/child relationships *cannot* be modified via updates.)
 *      The update objects will be merged with the current raw data for the Record being updated,
 *      it is only necessary to include values which have changed since the last update/initial
 *      load.
 * @property {Object[]} [add] - list of raw data representing records to be added, Each top-level
 *      item in the array must be either a rawData object of the form passed to loadData or
 *      a wrapper object of the form `{parentId: x, rawData: {}}`, where `parentId` provides
 *      a pointer to the intended parent if the record is not to be added to the root. The rawData
 *      *can* include a children property that will be processed into new child records.
 *      (Meaning: adds can be used to add new branches to the tree.)
 * @property {string[]} [remove] - list of ids representing records to be removed. Any children of
 *      these records will also be removed.
 * @property {Object} [rawSummaryData] - update to the dedicated summary row for this store.
 *      If the store has its `loadRootAsSummary` flag set to true, the summary record should
 *      instead be provided via the `update` property.
 */
