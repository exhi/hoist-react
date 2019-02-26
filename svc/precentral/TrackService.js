/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {stripTags} from '@xh/hoist/utils/js';

import {BaseTrackService} from '../BaseTrackService';


@HoistService
export class TrackService extends BaseTrackService {
    track(options) {
        let msg = options;
        if (typeof msg !== 'string') {
            msg = options.msg !== undefined ? options.msg : options.message;
        }

        const username = XH.getUsername();
        if (!username) return;

        const params = {
            msg: stripTags(msg),
            clientUsername: username
        };

        try {
            if (options.category)               params.category = options.category;
            if (options.data)                   params.data = JSON.stringify(options.data);
            if (options.elapsed !== undefined)  params.elapsed = options.elapsed;
            if (options.severity)               params.severity = options.severity;

            const consoleMsg =
                [params.category, params.msg, params.elapsed]
                    .filter(it => it != null)
                    .join(' | ');

            console.log(consoleMsg);

            XH.fetchJson({
                url: 'xh/track',
                params: params
            });
        } catch (e) {
            console.error('Failure tracking message: ' + params.msg);
        }
    }
}
