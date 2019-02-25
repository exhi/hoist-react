/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistService} from '@xh/hoist/core';
import {throwIf} from '@xh/hoist/utils/js';
import {BasePrefService} from '../BasePrefService';

@HoistService
export class PrefService extends BasePrefService {

    _prefs = {
        xhTheme: 'light',
        xhIdleDetectionDisabled: true
    };

    hasKey(key) {
        return false;
    }

    get(key, defaultValue) {
        let ret = this._prefs[key];
        if (!ret) {
            ret = defaultValue;
        }
        throwIf(ret === undefined, `Preference key not found: '${key}'`);
        return ret;
    }
}
