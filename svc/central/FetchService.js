/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {Exception} from '@xh/hoist/exception';
import {throwIf} from '@xh/hoist/utils/js';
import {stringify} from 'qs';
import {BaseFetchService} from '../BaseFetchService';

@HoistService
export class FetchService extends BaseFetchService {

    services = {};

    resolveServiceUrl(service) {
        if (!service || !XH.configService) {
            return XH.baseUrl;
        }
        return XH.getConf('service.' + service + '.baseUrl', XH.baseUrl);
    }

    async fetch(opts) {
        let {params, method, contentType, url, autoAbortKey, service, skipAuth} = opts;
        throwIf(!url, 'No url specified in call to fetchService.');

        // 1) Compute / install defaults
        if (!method) {
            method = (params ? 'POST' : 'GET');
        }

        if (!contentType) {
            contentType = (method === 'POST') ? 'application/x-www-form-urlencoded': 'text/plain';
        }

        if (!url.startsWith('/') && !url.includes('//')) {
            url = this.resolveServiceUrl(service) + url;
        }

        // 2) Prepare merged options
        const defaults = {
                method,
                cors: true,
                credentials: 'include',
                redirect: 'follow',
                headers: new Headers({'Content-Type': contentType})
            },
            fetchOpts = Object.assign(defaults, opts);

        if (opts.acceptJson) {
            fetchOpts.headers.append('Accept', 'application/json');
            delete fetchOpts.acceptJson;
        }

        // Set auth header
        if (!skipAuth) {
            let accessToken = await XH.authService.getAccessTokenAsync();
            if (accessToken) {
                fetchOpts.headers.append('Authorization', 'Bearer ' + accessToken);
            }
        }

        // 3) Preprocess and apply params
        if (params) {
            const qsOpts = {arrayFormat: 'repeat', allowDots: true, ...opts.qsOpts},
                paramsString = (contentType == 'application/json') ? JSON.stringify(params) : stringify(params, qsOpts);

            if (['POST', 'PUT'].includes(method)) {
                fetchOpts.body = paramsString;
            } else {
                url += '?' + paramsString;
            }
        }

        // 4) Cancel prior request, and add new AbortController if autoAbortKey used
        if (autoAbortKey) {
            this.abort(autoAbortKey);
            const ctlr = new AbortController();
            fetchOpts.signal = ctlr.signal;
            this.autoAbortControllers[autoAbortKey] = ctlr;
        }

        delete fetchOpts.contentType;
        delete fetchOpts.url;

        let ret;
        try {
            ret = await fetch(url, fetchOpts);
        } catch (e) {
            if (e.name == 'AbortError') throw Exception.fetchAborted(opts, e);
            throw Exception.serverUnavailable(opts, e);
        }

        if (autoAbortKey) {
            delete this.autoAbortControllers[autoAbortKey];
        }

        if (!ret.ok) {
            ret.responseText = await this.safeResponseTextAsync(ret);
            throw Exception.fetchError(opts, ret);
        }
        return ret;
    }
}