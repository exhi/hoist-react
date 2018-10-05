/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {fmtDate} from '@xh/hoist/format';
import {isNil, isString} from 'lodash';
/**
 * A set of validation functions to assist in form field validation
 */


/**
 * Validate the presence of a field. String values must also not be empty, or all spaces.
 */
export const required = ({value, displayName}) => {
    if (isNil(value) || (isString(value) && value.trim().length == 0)) return `${displayName} is required.`;
};

/**
 * Validate length of a string.
 */
export function lengthIs({min, max}) {
    return ({value, displayName}) => {
        if (isNil(value)) return null;

        if (min != null && value.length < min) return `${displayName} must contain at least ${min} characters.`;
        if (max != null && value.length > max) return `${displayName} must contain no more than ${max} characters.`;
    };
}

/**
 * Validate a number.
 */
export function numberIs({min, max, notZero}) {
    return ({value, displayName}) => {
        if (isNil(value)) return null;

        if (notZero && value === 0) return `${displayName} must not be zero.`;
        if (min != null && value < min) return `${displayName} must be greater than or equal to ${min}.`;
        if (max != null && value > max) return `${displayName} must be less than or equal to ${max}.`;
    };
}

/**
 * Validate a date. Accepted values for min and max are:
 *  null (no date validation performed)
 *  Date object - or any object that can be directly compared to Date(), e.g. moment()
 *  'now' (is equated to Date() and then compared with value)
 */

export function dateIs({min, max, fmt = 'YYYY-MM-DD'}) {
    return ({value, displayName}) => {
        min = min === 'now' ? new Date() : min;
        max = max === 'now' ? new Date() : max;

        if (isNil(value)) return null;

        if (min != null && value < min) return `${displayName} must not be before ${fmtDate(min, {fmt})}.`;
        if (max != null && value > max) return `${displayName} must not be after ${fmtDate(max, {fmt})}.`;
    };
}