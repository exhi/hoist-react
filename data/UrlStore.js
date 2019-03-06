/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, LoadSupport} from '@xh/hoist/core';

import {LocalStore} from './LocalStore';

/**
 * A store with built-in support for loading data from a URL.
 */
@LoadSupport
export class UrlStore extends LocalStore {

    url;
    dataRoot;
    service;

    /**
     * @param {Object} c - UrlStore configuration.
     * @param {string} c.url - URL from which to load data.
     * @param {?string} [c.dataRoot] - Key of root node for records in returned data object.
     * @param {...*} - Additional arguments to pass to LocalStore.
     */
    constructor({url, dataRoot = null, service = null, ...localStoreArgs}) {
        super(localStoreArgs);
        this.url = url;
        this.dataRoot = dataRoot;
        this.service = service;
    }

    /**
     * Reload store from url.
     */
    async doLoadAsync(loadSpec) {
        const {url, service, dataRoot} = this;
        return XH
            .fetchJson({url, service, loadSpec})
            .then(data => {
                if (dataRoot) data = data[dataRoot];
                return this.loadData(data);
            });
    }
}