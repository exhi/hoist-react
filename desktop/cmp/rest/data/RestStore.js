/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {UrlStore, Record} from '@xh/hoist/data';
import {pickBy} from 'lodash';

import {RestField} from './RestField';

/**
 * Store with additional support for RestGrid.
 *
 * Provides support for lookups, and CRUD operations on records.
 */
export class RestStore extends UrlStore {

    _lookupsLoaded = false;

    /**
     * @param {Object} c - RestStore configuration.
     * @param {string} c.url - URL from which to load data.
     * @param {?string} [c.dataRoot] - Key of root node for records in returned data object.
     * @param {boolean} [c.reloadLookupsOnLoad] - Whether lookups should be loaded each time
     *      new data is loaded or updated by this client.
     * @param {...*} - Additional arguments to pass to UrlStore.
     */
    constructor({url, dataRoot = 'data', reloadLookupsOnLoad = false, ...urlStoreArgs}) {
        super({url, dataRoot, ...urlStoreArgs});
        this.reloadLookupsOnLoad = reloadLookupsOnLoad;
    }

    get defaultFieldClass() {
        return RestField;
    }

    async loadAsync() {
        await this.ensureLookupsLoadedAsync();
        return super.loadAsync();
    }

    async deleteRecordAsync(rec) {
        const {url} = this;

        return XH.fetchJson({
            url: `${url}/${rec.id}`,
            method: 'DELETE'
        }).then(() => {
            this.deleteRecordInternal(rec);
        }).linkTo(
            this.loadModel
        );
    }

    async addRecordAsync(rec) {
        return this.saveRecordInternalAsync(rec, true);
    }

    async saveRecordAsync(rec) {
        return this.saveRecordInternalAsync(rec, false);
    }

    //--------------------------------
    // Implementation
    //--------------------------------
    async saveRecordInternalAsync(rec, isAdd) {
        let {url} = this;
        if (!isAdd) url += '/' + rec.id;

        // Only include editable fields in the request data
        const editableFields = this.fields.filter(it => it.editable).map(it => it.name),
            data = pickBy(rec, (v, k) => k == 'id' || editableFields.includes(k));
        return XH.fetchService[isAdd ? 'postJson' : 'putJson']({
            url,
            body: {data}
        }).then(response => {
            const newRec = new Record({fields: this.fields, raw: response.data});
            if (isAdd) {
                this.addRecordInternal(newRec);
            } else {
                this.updateRecordInternal(rec, newRec);
            }
        }).then(() => {
            return this.ensureLookupsLoadedAsync();
        }).linkTo(
            this.loadModel
        );
    }

    async ensureLookupsLoadedAsync() {
        if (!this._lookupsLoaded || this.reloadLookupsOnLoad) {
            const lookupFields = this.fields.filter(it => !!it.lookupName);
            if (lookupFields.length) {
                const lookupData = await XH.fetchJson({url: `${this.url}/lookupData`});
                lookupFields.forEach(f => {
                    f.lookup = lookupData[f.lookupName];
                });
            }
            this._lookupsLoaded = true;
        }
    }
}