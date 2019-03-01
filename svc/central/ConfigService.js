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
        const configs = await XH.fetchJson({url: 'configs/' + XH.environmentService.get('appCode')});
        configs.forEach(config => {
            this._data[config.name] = config.value;
        });
        deepFreeze(this._data);
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
