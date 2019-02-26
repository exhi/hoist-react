/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {debounce, isNil, isEqual, isEmpty, pickBy, map, cloneDeep, forEach} from 'lodash';
import {XH, HoistService} from '@xh/hoist/core';
import {SECONDS} from '@xh/hoist/utils/datetime';
import {throwIf, deepFreeze} from '@xh/hoist/utils/js';
import {BasePrefService} from '../BasePrefService';

@HoistService
export class PrefService extends BasePrefService {

    _data = {};
    _updates = {};
    _localStorageKey = 'localPrefs';

    constructor() {
        super();
        const pushFn = () => this.pushPendingAsync();
        window.addEventListener('unload', pushFn);
        this.pushPendingBuffered = debounce(pushFn, 5 * SECONDS);
    }

    async initAsync() {
        await this.loadPrefsAsync();
    }

    hasKey(key) {
        return this._data.hasOwnProperty(key);
    }

    get(key, defaultValue) {
        const data = this._data;
        let ret = defaultValue;

        if (data.hasOwnProperty(key)) {
            ret = data[key].value;
        }

        throwIf(ret === undefined, `Preference key not found: '${key}'`);
        return ret;
    }

    set(key, value) {
        this.validateBeforeSet(key, value);

        const oldValue = this.get(key);
        if (isEqual(oldValue, value)) return;

        // Change local value to sanitized copy and fire.
        value = deepFreeze(cloneDeep(value));
        this._data[key].value = value;
        this.fireEvent('prefChange', {key, value, oldValue});

        // Schedule serialization to storage
        this._updates[key] = value;
        this.pushPendingBuffered();
    }

    async pushAsync(key, value) {
        this.validateBeforeSet(key, value);
        this.set(key, value);
        return this.pushPendingAsync();
    }

    clearLocalValues() {
        XH.localStorageService.remove(this._localStorageKey);
    }

    async clearAllAsync() {
        this.clearLocalValues();
        await XH.fetchJson({
            url: 'xh/clearPrefs',
            params: {clientUsername: XH.getUsername()}
        });
        return this.loadPrefsAsync();
    }

    async pushPendingAsync() {
        const updates = this._updates;

        if (isEmpty(updates)) return;

        // clear obj state immediately to allow picking up next batch during async operation
        this._updates = {};

        const remoteUpdates = pickBy(updates, (v, k) => !this.isLocalPreference(k)),
            localUpdates = pickBy(updates, (v, k) => this.isLocalPreference(k));

        if (!isEmpty(localUpdates)) {
            XH.localStorageService.apply(this._localStorageKey, localUpdates);
        }

        if (!isEmpty(remoteUpdates)) {
            await XH.fetchJson({
                url: 'xh/setPrefs',
                params: {
                    updates: JSON.stringify(remoteUpdates),
                    clientUsername: XH.getUsername()
                }
            });
        }

        const evtData = map(updates, (value, key) => ({key, value}));
        this.fireEvent('prefsPushed', {prefs: evtData});
    }


    //-------------------
    //  Implementation
    //-------------------
    async loadPrefsAsync() {
        const data = await XH.fetchJson({
            url: 'xh/getPrefs',
            params: {clientUsername: XH.getUsername()}
        });
        forEach(data, v => {
            deepFreeze(v.value);
            deepFreeze(v.defaultValue);
        });
        this._data = data;
        this.syncLocalPrefs();
    }

    syncLocalPrefs() {
        const localPrefs = XH.localStorageService.get(this._localStorageKey, {}),
            data = this._data;

        this.cleanLocalPrefs(localPrefs);

        for (let key in data) {
            if (data[key].local) {
                data[key].value = !isNil(localPrefs[key]) ?
                    deepFreeze(cloneDeep(localPrefs[key])) :
                    data[key].defaultValue;
            }
        }
    }

    cleanLocalPrefs(localPrefs) {
        const data = this._data;

        for (let pref in localPrefs) {
            if (!data.hasOwnProperty(pref)) this.removeLocalValue(pref);
        }
    }

    removeLocalValue(key) {
        const hasRemoveValue = this._data.hasOwnProperty(key);

        throwIf(
            hasRemoveValue && !this.isLocalPreference(key),
            `${key} is not a local preference.`
        );

        const localPrefs = XH.localStorageService.get(this._localStorageKey, {});

        delete localPrefs[key];

        if (hasRemoveValue) this._data[key].value = this._data[key].defaultValue;

        XH.localStorageService.set(this._localStorageKey, localPrefs);
    }

    isLocalPreference(key) {
        const pref = this._data[key];
        return pref && pref.local;
    }

    validateBeforeSet(key, value) {
        const pref = this._data[key];


        throwIf(!pref, `Cannot set preference ${key}: not found`);

        throwIf(value === undefined, `Cannot set preference ${key}: value not defined`);

        throwIf(
            !this.valueIsOfType(value, pref.type),
            `Cannot set preference ${key}: must be of type ${pref.type}`
        );
    }

    valueIsOfType(value, type) {
        const valueType = typeof value;

        switch (type) {
            case 'string':
                return valueType === 'string';
            case 'int':
            case 'long':
            case 'double':
                return valueType === 'number';
            case 'bool':
                return valueType === 'boolean';
            case 'json':
                return valueType === 'object';
            default:
                return false;
        }
    }
}
