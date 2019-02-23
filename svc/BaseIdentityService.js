/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH} from '@xh/hoist/core';

/**
 * Provides basic information related to the authenticated user, including application roles.
 * This service loads its data from Hoist Core's server-side identity service.
 *
 * Also provides support for recognizing impersonation and distinguishing between the apparent and
 * actual underlying user.
 */
export class BaseIdentityService {

    async initAsync() {}

    /**
     * The current acting user (see authUser below for notes on impersonation). This is a JS
     * object with username, displayName, email, roles, and any other properties serialized by
     * HoistUser on the server, as well as hasRole() and hasGate() convenience functions.
     */
    get user() {}

    /** The current acting user's username. */
    get username() {
        return this._apparentUser ? this._apparentUser.username : null;
    }
    
    /**
     * The actual user who authenticated to the web application. This will be the same as the user
     * except when an administrator is impersonation another user for troubleshooting or testing.
     * In those cases, this getter will return the actual administrator, whereas this.user will
     * return the user they are impersonating.
     */
    get authUser() {}

    /** The current auth user's username. */
    get authUsername() {
        return this._authUser ? this._authUser.username : null;
    }

    //------------------------
    // Impersonation
    //------------------------
    /** Is an impersonation session currently active? */
    get isImpersonating() {
        return this.authUsername !== this.username;

    }

    hasGate(gate, user) {
        const gateUsers =  XH.getConf(gate, '').trim(),
            tokens = gateUsers.split(',').map(it => it.trim()),
            groupPattern = /\[([\w-]+)\]/;

        if (gateUsers === '*' || tokens.includes(user.username)) return true;

        for (let i = 0; i < tokens.length; i++) {
            const match = groupPattern.exec(tokens[i]);
            if (match && this.hasGate(match[1], user)) return true;

        }
        return false;
    }
}
