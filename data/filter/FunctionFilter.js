/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {throwIf} from '@xh/hoist/utils/js';
import {isFunction} from 'lodash';

import {Filter} from './Filter';

/**
 * Filters via a custom function specified by the developer or generated by a component such as
 * StoreFilterField.
 *
 * Immutable.
 */
export class FunctionFilter extends Filter {

    get isFunctionFilter() {return true}

    /** @member {function} */
    testFn;

    /**
     * Constructor - not typically called by apps - create from config via `parseFilter()` instead.
     *
     * @param {Object} c - FunctionFilter config.
     * @param {FilterTestFn} c.testFn - function taking a Record or Object and returning a boolean.
     */
    constructor({testFn}) {
        super();
        throwIf(!isFunction(testFn), 'FunctionFilter requires a `testFn`');
        this.testFn = testFn;
        Object.freeze(this);
    }


    //-----------------
    // Overrides
    //-----------------
    getTestFn(store) {
        return this.testFn;
    }

    equals(other) {
        return other?.isFunctionFilter && this.testFn === other.testFn;
    }
}
