/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {isEqual, isNil} from 'lodash';
import {throwIf} from '@xh/hoist/utils/js';

/**
 * Wrapper object for each data element within a {@see Store}.
 *
 * Records are intended to be created and managed internally by Store implementations and should
 * most not typically be constructed directly within application code.
 */
export class Record {

    /** @member {(string|number)} */
    id;
    /** @member {(string|number)} */
    parentId;
    /** @member {Store} */
    store;
    /** @member {Object} */
    raw;
    /** @member {String[]} - unique path within hierarchy - for ag-Grid implementation. */
    xhTreePath;

    /** @returns {Record} */
    get parent() {
        return this.parentId != null ? this.store.getById(this.parentId) : null;
    }

    /** @member {Field[]} */
    get fields() {
        return this.store.fields;
    }

    /**
     * The children of this record, respecting any filter (if applied).
     * @returns {Record[]}
     */
    get children() {
        return this.store.getChildrenById(this.id, true);
    }

    /**
     * All children of this record unfiltered.
     * @returns {Record[]}
     */
    get allChildren() {
        return this.store.getChildrenById(this.id, false);
    }

    get isSummary() {
        return this === this.store.summaryRecord;
    }

    /**
     * Construct a Record from a raw source object. Extract values from the source object for all
     * Fields defined on the given Store and install them as top-level properties on the new Record.
     *
     * This process will apply basic conversions if required, based on the specified Field types.
     * Properties of the raw object *not* included in the store's Fields config will be ignored.
     *
     * Also tracks a pointer to its parent record, if any, via that parent's ID. (Note this is
     * deliberately not a direct object reference, to allow parent records to be recreated without
     * requiring children to also be recreated.)
     *
     * @param {Object} c - Record configuration
     * @param {Object} c.data - data used to construct this record,
     *      pre-processed if applicable by `store.processRawData()`.
     * @param {Object} c.raw - the same data, prior to any store pre-processing.
     * @param {Store} c.store - store containing this record.
     * @param {Record} [c.parent] - parent record, if any.
     */
    constructor({data, raw, store, parent}) {
        const id = store.buildRecordId(data);

        throwIf(isNil(id), "Record has an undefined ID. Use 'Store.idSpec' to resolve a unique ID for each record.");

        this.id = id;
        this.store = store;
        this.raw = raw;
        this.parentId = parent ? parent.id : null;
        this.xhTreePath = parent ? [...parent.xhTreePath, id] : [id];

        store.fields.forEach(f => {
            const {name} = f;
            throwIf(
                name in this,
                `Field name "${name}" cannot be used for data. It is reserved as a top-level property of the Record class.`
            );
            this[name] = f.parseVal(data[name]);
        });
    }

    /**
     * Determine if another record is entirely equivalent to the current record in terms of its
     * enumerated data, containing store, and place within any applicable tree hierarchy.
     * @param {Record} rec - the other record to compare.
     * @returns {boolean}
     */
    isEqual(rec) {
        return (
            this.id == rec.id &&
            this.parentId == rec.parentId &&
            isEqual(this.xhTreePath, rec.xhTreePath) &&
            this.store == rec.store &&
            this.store.fields.every(f => f.isEqual(this[f.name], rec[f.name]))
        );
    }

}

