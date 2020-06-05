/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {LocalStorageProvider, PrefProvider, DashViewProvider} from '../';
import {
    isUndefined,
    cloneDeep,
    get,
    set,
    unset,
    isNumber,
    debounce as lodashDebounce
} from 'lodash';
import {throwIf} from '@xh/hoist/utils/js';

/**
 * Object that can be used by a component to store/restore state from a given persistent location.
 * This is an abstract class.
 *
 * Note that multiple instances of this object may be writing into the same location.
 * Implementations should take care to incorporate any writes immediately into the readable state.
 */
export class PersistenceProvider {

    get isPersistenceProvider() {return true}

    path;
    debounce;

    /**
     * Construct an instance of this class.
     *
     * @param {PersistOptions} spec
     * @return {PersistenceProvider}
     */
    static create({type, ...rest}) {
        if (!type) {
            if (rest.prefKey) type = 'pref';
            if (rest.localStorageKey) type = 'localStorage';
            if (rest.dashViewModel) type = 'dashView';
        }

        switch (type) {
            case 'pref':
                return new PrefProvider(rest);
            case 'localStorage':
                return new LocalStorageProvider(rest);
            case `dashView`:
                return new DashViewProvider(rest);
            default:
                throw XH.exception(`Unknown Persistence Provider for type: ${type}`);
        }
    }

    /**
     * @private
     *
     * Called by implementations only.  See create.
     *
     * @param {string} path - dot delimited path
     * @param {number|object} debounce
     */
    constructor({path, debounce = 250}) {
        throwIf(isUndefined(path), 'Path not specified in PersistenceProvider.');
        this.path = path;
        this.debounce = debounce;
        if (debounce) {
            this.writeInternal = isNumber(debounce) ?
                lodashDebounce(this.writeInternal, debounce) :
                lodashDebounce(this.writeInternal, debounce.interval, debounce);
        }
    }

    /**
     * Read data at a path
     */
    read() {
        return get(this.readRaw(), this.path);
    }

    /**
     * Save data at a path
     * @param {*} data  - data to be written to the path. Must be serializable to json.
     */
    write(data) {
        this.writeInternal(data);
    }

    /**
     * Clear any state saved by this object at a path
     */
    clear(path = this.path) {
        const obj = cloneDeep(this.readRaw());
        unset(obj, this.path);
        this.writeRaw(obj);
    }

    /**
     * Clear *all* state held by this object.
     */
    clearAll() {
        this.clearRaw();
    }

    //----------------
    // Implementation
    //----------------
    writeInternal(data) {
        const obj = cloneDeep(this.readRaw());
        set(obj, this.path, data);
        this.writeRaw(obj);
    }

    writeRaw(obj) {}
    readRaw() {}
    clearRaw() {}
}