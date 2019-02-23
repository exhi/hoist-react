/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {BaseAuthService} from '../BaseAuthService';

@HoistService
export class AuthService extends BaseAuthService {

    async isAuthenticatedAsync() {
        try {
            const ret = await XH.fetchJson({url: 'xh/authStatus'});
            return ret.authenticated;
        } catch (e) {
            if (e.httpStatus != 401) throw e;
        }
        return false;
    }

    async loginAsync(username, password) {
        try {
            const ret = await XH.postJson({
                url: 'xh/login',
                params: {username, password}
            });
            if (ret.success) {
                return true;
            }
        } catch (e) {
            if (e.httpStatus != 401) throw e;
        }
        return false;
    }

    async logoutAsync() {
        this._username = null;
        await XH.fetchJson({url: 'xh/logout'});
        XH.reloadApp();
    }
}
