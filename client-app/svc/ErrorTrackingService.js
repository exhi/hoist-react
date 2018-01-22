/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {BaseService} from './BaseService';
import {XH, environmentService} from 'hoist';
import {stripTags} from 'hoist/utils/HtmlUtils';
import {stringifyErrorSafely} from 'hoist/utils/ErrorUtils';

export class ErrorTrackingService extends BaseService {

    /**
     * Create a Client Exception entry. Client metadata will be set automatically.
     * App version is POSTed to reflect the version the client is running (vs the version on the server)
     * @param options - Map with msg & exception - both optional, although at least one should be provided!
     */
    async submitAsync({msg, exception} = {}) {
        const error = exception ? stringifyErrorSafely(exception) : null;

        await XH.fetchJson({
            url: 'hoistImpl/submitError',
            params: {
                msg: msg ? stripTags(msg) : null,
                error: error,
                appVersion: environmentService.get('appVersion')
            }
        });
    }
}