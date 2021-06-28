/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */


import {parseFieldValue} from '@xh/hoist/data';


// ---------------------------------------------------------
// Generate Options for FilterChooserModel query responses.
// Options are simple objects to support Select API.
//----------------------------------------------------------
/**
 * Create an option representing a field suggestion
 * @return {FilterChooserOption}
 */
export function fieldOption({fieldSpec, isExact = false}) {
    const {displayName} = fieldSpec;
    return {
        type: 'field',
        value: JSON.stringify({displayName}),
        label: displayName,
        isExact,

        fieldSpec
    };
}

/**
 * Create an option representing an existing or suggested filter.
 * @return {FilterChooserOption}
 */
export function filterOption({filter, fieldSpec, isExact = false}) {
    let label,
        displayOp,
        displayValue;

    if (filter.isFieldFilter) {
        const {fieldType, displayName} = fieldSpec;
        if (filter.isEmptyCheck()) {
            displayOp = 'is';
            displayValue = (filter.op === '!=' ? 'not empty' : 'empty');
        } else {
            displayOp = filter.op;
            displayValue = fieldSpec.renderValue(parseFieldValue(filter.value, fieldType, null));
        }
        label = `${displayName} ${displayOp} ${displayValue}`;
    } else if (filter.isCompoundFilter) {
        label = `${filter.op} Compound Filter`;
    }

    return {
        type: 'filter',
        value: JSON.stringify(filter),
        label,
        isExact,

        displayOp,
        displayValue,
        filter,
        fieldSpec
    };
}

/**
 * Create an option representing an [unselectable] message
 * @return {FilterChooserOption}
 */
export function msgOption(msg) {
    return {
        type: 'msg',
        value: msg,
        label: msg,
        isExact: false
    };
}

/**
 * @typedef {Object} FilterChooserOption - option generated for a `FilterChooser` `Select` input.
 * @property {string} type - one of ['filter'|'field'|'msg'] - indicates if option allows user to
 *      select a fully-formed filter or a field to use for filtering, or if option is an
 *      unselectable informational message.
 * @property {string} value  - unique value for the underlying Select.
 * @property {string} label - unique display for the underlying Select.
 * @property {boolean} isExact - if based on a matching process, was this an exact match?
 */
