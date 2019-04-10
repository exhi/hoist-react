/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Record} from '@xh/hoist/data/Record';
import {throwIf} from '@xh/hoist/utils/js';
import {startCase, isEqual} from 'lodash';
import {XH} from "@xh/hoist/core";

/**
 * Metadata for an individual data field within a Store record.
 * @alias HoistField
 */
export class Field {

    name;
    type;
    label;
    defaultValue;

    /**
     * @param {Object} c - Field configuration.
     * @param {string} c.name - unique key representing this field.
     * @param {string} [c.type] - one of ['string', 'number', 'bool', 'json', 'date', 'day', 'auto']
     *      Default 'auto' indicates no conversion.
     * @param {string} [c.label] - label for display, defaults to capitalized name.
     * @param {boolean} [c.nullable] - true if field can contain null as a valid value.
     * @param {*} [c.defaultValue] - value to be used for records with a null, or non-existent value.
     */
    constructor({
        name,
        type = 'auto',
        label = startCase(name),
        nullable = true,
        defaultValue = null
    }) {

        throwIf(
            Record.RESERVED_FIELD_NAMES.includes(name),
            `Field name "${name}" cannot be used. It is reserved as a top-level property of the Record class.`
        );

        this.name = name;
        this.type = type;
        this.label = label;
        this.nullable = nullable;
        this.defaultValue = defaultValue;
    }

    parseVal(val) {
        const {type, defaultValue} = this;
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
        return val;
    }

    isEqual(val1, val2) {
        return isEqual(val1, val2);
    }
}