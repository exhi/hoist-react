/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {deepFreeze, throwif} from '@xh/hoist/utils/js';
import {BaseIdentityService} from '../BaseIdentityService';

@HoistService
export class IdentityService extends BaseIdentityService {

    _user = null;
    _apparentUser = null;
    
    async initAsync() {
        const data = await XH.fetchJson({url: 'identities/' + XH.authService.username});
        if (data.username) {
            this._apparentUser = this._user = this.createUser(data);
        }

        if (XH.authService.username != XH.authService.apparentUsername) {
            const data2 = await XH.fetchJson({url: 'identities/' + XH.authService.apparentUsername});
            this._apparentUser = this.createUser(data2);
        }
    }

    get user() {
        return this._apparentUser;
    }

    get authUser() {
        return this._user;
    }

    hasRole(role) {
        return this.authUser.hasRole(role);
    }

    async impersonateAsync(username) {
        this.ensurePermission();
        return XH.fetchJson({
            url: 'auth/impersonate',
            service: 'hoist-central',
            params: {
                username: username
            }
        });
    }

    async endImpersonateAsync() {
        return XH.fetchJson({
            url: 'auth/endImpersonate',
            service: 'hoist-central'
        }).then(() => {
            XH.reloadApp();
        }).catchDefault({
            message: 'Failed to end impersonation'
        });
    }

    async getImpersonationTargetsAsync() {
        return XH.fetchJson({
            url: 'identities',
            service: 'hoist-central'
        }).then((users) => {
            return users.map(t => t.username)
                .filter(t => t !== this._user.username)
                .sort();
        })
    }

    //------------------------
    // Implementation
    //------------------------
    ensurePermission() {
        throwIf(!this._user.isHoistAdmin, 'User does not have right to impersonate.');
    }

    createUser(user) {
        if (!user) return null;
        user.hasRole = (role) => user.roles.includes(role);
        user.isHoistAdmin = user.hasRole('HOIST_ADMIN');
        user.hasGate = (gate) => this.hasGate(gate, user);
        return deepFreeze(user);
    }
}
