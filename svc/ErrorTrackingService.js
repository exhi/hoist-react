/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistService} from 'hoist/core';
import {stripTags} from 'hoist/utils/HtmlUtils';
import {stringifyErrorSafely} from 'hoist/exception';

@HoistService()
export class ErrorTrackingService {

    /**
     * Create a Client Exception entry. Client metadata will be set automatically.
     * App version is POSTed to reflect the version the client is running (vs the version on the server)
     * @param options - Map with message & exception - both optional, although at least one should be provided!
     */
    async submitAsync({message, exception}) {
        const error = exception ? stringifyErrorSafely(exception) : null;

        await XH.fetchJson({
            url: 'hoistImpl/submitError',
            params: {
                error,
                msg: message ? stripTags(message) : null,
                appVersion: XH.getEnv('appVersion')
            }
        });
    }
}