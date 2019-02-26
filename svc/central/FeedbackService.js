/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistService} from '@xh/hoist/core';
import {BaseFeedbackService} from '../BaseFeedbackService';

@HoistService
export class FeedbackService extends BaseFeedbackService {
    async saveFeedback(message) {
        console.log('Feedback not supported by Hoist Central');
        // return XH.fetchJson({
        //     url: 'feedback',
        //     params: {
        //         msg: message,
        //         username: XH.getUsername(),
        //         appVersion: XH.getEnv('appVersion')
        //     }
        // });
    }
}
