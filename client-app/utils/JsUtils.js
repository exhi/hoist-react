/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {isArray} from 'lodash';

export function findByProperty(arr, property, value) {
    return arr.find(it => it[property] === value);
}

export function deepClone(a) {
    return JSON.parse(JSON.stringify(a));
}

export function shallowClone(a) {
    return Object.assign({}, a);
}

export function asArray(val) {
    if (val === undefined || val === null) return [];
    if (isArray(val)) return val;
    return [val];
}