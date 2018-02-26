/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {BaseService} from './BaseService';
import {XH} from 'hoist/core';
import {cloneDeep} from 'lodash';

export class ConfigService extends BaseService {

    _data = {};

    async initAsync() {
        this._data = await XH.fetchJson({url: 'hoistImpl/getConfig'});
    }

    get(key, defaultValue) {
        const data = this._data;
        if (data.hasOwnProperty(key)) {
            return cloneDeep(data[key]);
        }
        if (defaultValue === undefined) {
            throw XH.exception(`Config key not found: '${key}'`);
        }
        return defaultValue;
    }
}
