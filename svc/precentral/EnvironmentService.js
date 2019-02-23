/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import React from 'react';
import {XH, HoistService} from '@xh/hoist/core';
import {version as hoistReactVersion} from '@xh/hoist/package.json';
import {defaults} from 'lodash';
import {deepFreeze} from '@xh/hoist/utils/js';
import {BaseEnvironmentService} from '../BaseEnvironmentService';

@HoistService
export class EnvironmentService extends BaseEnvironmentService {

    _data = {};
    
    async initAsync() {
        const serverEnv = await XH.fetchJson({url: 'xh/environment'});

        // Favor client-side data injected via Webpack build or otherwise determined locally,
        // then apply all other env data sourced from the server.
        this._data = defaults({
            appCode: XH.appCode,
            appName: XH.appName,
            clientVersion: XH.appVersion,
            clientBuild: XH.appBuild,
            hoistReactVersion: hoistReactVersion,
            reactVersion: React.version
        }, serverEnv);

        deepFreeze(this._data);

        return super.initAsync();
    }

    get(key) {
        return this._data[key];
    }
}
