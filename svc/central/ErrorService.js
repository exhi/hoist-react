/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistService} from '@xh/hoist/core';
import {BaseErrorService} from '../BaseErrorService';

@HoistService
export class ErrorService extends BaseErrorService {
    async saveError(message, error, userAlerted) {
        console.log('Error saving not supported by Hoist Central');
        // try {
        //     return XH.fetchJson({
        //         url: 'clientErrors',
        //         params: {
        //             msg: stripTags(message),
        //             error: stringifyErrorSafely(error),
        //             clientUsername: XH.getUsername(),
        //             userAlerted: userAlerted,
        //             userAgent: window.navigator.userAgent,
        //             appVersion: XH.getEnv('appVersion')
        //         }
        //     });
        // } catch (e) {
        //     console.error('Failure saving message: ' + message);
        // }
    }
}
