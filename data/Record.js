/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {clone} from 'lodash';

/**
 * Core data for Store.
 *
 * This object is intended to be created and managed internally by Store implementations.
 */
export class Record {

    static RESERVED_FIELD_NAMES = ['raw', 'fields', 'children', 'parent']

    /** @member {string} - unique ID. */
    id;
    /** @member {Object} - unconverted source data. */
    raw;
    /** @member {Field[]} - fields for this record. */
    fields;
    /** @member {Record[]} - Children of this record. */
    children;
    /** @member {Record} - Parent of this record. */
    parent;

    /**
     * Will apply basic validation and conversion (e.g. 'date' will convert from UTC time to
     * a JS Date object). An exception will be thrown if the validation or conversion fails.
     */
    constructor({raw, parent, fields, children = []}) {
        this.id = raw.id;
        this.raw = raw;
        this.parent = parent;
        this.children = children;
        this.fields = fields;

        this.xhTreePath = parent ? [...parent.xhTreePath, this.id] : [this.id];

        fields.forEach(field => {
            const {type, name, defaultValue} = field;
            let val = raw[name];
            if (val === undefined || val === null) val = defaultValue;

            if (val !== null) {
                switch (type) {
                    case 'auto':
                    case 'string':
                    case 'int':
                    case 'number':
                    case 'bool':
                    case 'json':
                    case 'day':
                        break;
                    case 'date':
                        val = new Date(val);
                        break;
                    default:
                        throw XH.exception(`Unknown field type '${type}'`);
                }
            }
            this[name] = val;
        });
    }
    
    /**
     * Return a filtered version of this record.
     *
     * If the record fails the filter, null will be returned.
     * @return {Record}
     */
    applyFilter(filter) {
        let {children} = this;
        if (children) {
            children = children
                .map(child => child.applyFilter(filter))
                .filter(it => it != null);
        }

        if (children && children.length || filter(this)) {
            const ret = clone(this);
            ret.children = children;
            children.forEach(c => c.parent = ret);
            return ret;
        } else {
            return null;
        }
    }
}