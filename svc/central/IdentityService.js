/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistService} from '@xh/hoist/core';
import {deepFreeze} from '@xh/hoist/utils/js';
import {BaseIdentityService} from '../BaseIdentityService';

@HoistService
export class IdentityService extends BaseIdentityService {

    _user = null;
    _apparentUser = null;
    
    async initAsync() {
        const data = await XH.fetchJson({url: 'identities/' + XH.username});
        if (data.username) {
            this._apparentUser = this._user = this.createUser(data);
        }

        if (XH.username != XH.apparentUsername) {
            const data2 = await XH.fetchJson({url: 'identities/' + XH.apparentUsername});
            this._apparentUser = this.createUser(data2);
        }
        return super.initAsync();
    }

    get user() {
        return this._apparentUser;
    }

    get authUser() {
        return this._user;
    }

    //------------------------
    // Implementation
    //------------------------
    createUser(user) {
        if (!user) return null;
        user.isHoistAdmin = XH.hasRole('HOIST_ADMIN');
        user.hasGate = (gate) => this.hasGate(gate, user);
        return deepFreeze(user);
    }
}
