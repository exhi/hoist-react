/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistService, XH} from '@xh/hoist/core';
import {BaseFeedbackService} from '../BaseFeedbackService';

@HoistService
export class FeedbackService extends BaseFeedbackService {
    async saveFeedback(message) {
        return XH.fetchJson({
            url: 'xh/submitFeedback',
            params: {
                msg: message,
                username: XH.getUsername(),
                appVersion: XH.getEnv('appVersion')
            }
        });
    }
}
