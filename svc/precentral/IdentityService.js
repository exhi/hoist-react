/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {deepFreeze, throwIf} from '@xh/hoist/utils/js';
import {BaseIdentityService} from '../BaseIdentityService';

@HoistService
export class IdentityService extends BaseIdentityService {

    _authUser = null;
    _apparentUser = null;
    
    async initAsync() {
        const data = await XH.fetchJson({url: 'xh/getIdentity'});
        if (data.user) {
            this._apparentUser = this._authUser = this.createUser(data.user, data.roles);
        } else {
            this._apparentUser = this.createUser(data.apparentUser, data.apparentUserRoles);
            this._authUser = this.createUser(data.authUser, data.authUserRoles);
        }
    }

    get user() {
        return this._apparentUser;
    }

    get authUser() {
        return this._authUser;
    }

    hasRole(role) {
        return this.authUser.hasRole(role);
    }

    async impersonateAsync(username) {
        this.ensurePermission();
        return XH.fetchJson({
            url: 'xh/impersonate',
            params: {
                username: username
            }
        });
    }

    async endImpersonateAsync() {
        return XH.fetchJson({
            url: 'xh/endImpersonate'
        });
    }

    async getImpersonationTargetsAsync() {
        return XH.fetchJson({
            url: 'xh/impersonationTargets'
        }).then(targets => {
            return targets
                .map(t => t.username)
                .filter(t => t !== XH.getUsername())
                .sort();
        });
    }

    //------------------------
    // Implementation
    //------------------------
    ensurePermission() {
        throwIf(!this._authUser.canImpersonate, 'User does not have right to impersonate.');
    }

    createUser(user, roles) {
        if (!user) return null;
        user.roles = roles;
        user.hasRole = (role) => user.roles.includes(role);
        user.isHoistAdmin = user.hasRole('HOIST_ADMIN');
        user.canImpersonate = user.isHoistAdmin;
        user.hasGate = (gate) => this.hasGate(gate, user);
        return deepFreeze(user);
    }
}
