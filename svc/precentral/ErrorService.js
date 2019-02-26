/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistService, XH} from '@xh/hoist/core';
import {stringifyErrorSafely} from '@xh/hoist/exception';
import {stripTags} from '@xh/hoist/utils/js';
import {BaseErrorService} from '../BaseErrorService';

@HoistService
export class ErrorService extends BaseErrorService {
    async saveError(message, error, userAlerted) {
        try {
            return XH.fetchJson({
                url: 'xh/submitError',
                params: {
                    msg: stripTags(message),
                    error: stringifyErrorSafely(error),
                    clientUsername: XH.getUsername(),
                    userAlerted: userAlerted,
                    userAgent: window.navigator.userAgent,
                    appVersion: XH.getEnv('appVersion')
                }
            });
        } catch (e) {
            console.error('Failure saving message: ' + message);
        }
    }
}
