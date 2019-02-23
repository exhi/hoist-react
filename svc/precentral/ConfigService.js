/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {throwIf, deepFreeze} from '@xh/hoist/utils/js';
import {BaseConfigService} from '../BaseConfigService';

@HoistService
export class ConfigService extends BaseConfigService {

    _data = {};

    async initAsync() {
        this._data = await XH.fetchJson({url: 'xh/getConfig'});
        deepFreeze(this._data);
        return super.initAsync();
    }

    get(key, defaultValue) {
        const data = this._data;

        if (data.hasOwnProperty(key)) {
            return data[key];
        }

        throwIf(defaultValue === undefined, `Config key not found: '${key}'`);
        return defaultValue;
    }
}
