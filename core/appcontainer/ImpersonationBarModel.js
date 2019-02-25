/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';

/**
 *  Manage Impersonation.
 *
 *  @private
 */
@HoistModel
export class ImpersonationBarModel {

    @observable showRequested = false;
    @observable.ref targets = [];

    init() {
        this.addAutorun(() => {
            if (this.isOpen) this.ensureTargetsLoaded();
        });
    }

    get isOpen() {
        return this.showRequested || this.isImpersonating;
    }

    get isImpersonating() {
        return XH.identityService.isImpersonating;
    }

    get canImpersonate() {
        return XH.identityService.authUser.isHoistAdmin;
    }

    @action
    show() {
        this.ensurePermission();
        this.showRequested = true;
    }

    @action
    hide() {
        this.showRequested = false;
    }

    @action
    toggleVisibility() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Begin an impersonation session to act as another user. The UI server will allow this only
     * if the actual authenticated user has the HOIST_ADMIN role, and is attempting to impersonate
     * a known user who has permission to and has accessed the app themselves. If successful,
     * the application will reload and the admin will now be acting as the other user.
     *
     * @param {string} username - the end-user to impersonate
     */
    async impersonateAsync(username) {
        return XH.identityService.impersonateAsync(username)
            .then(() => {
                XH.reloadApp();
            });
    }

    /**
     * Exit any active impersonation, reloading the app to resume normal day-to-day life as yourself.
     */
    async endImpersonateAsync() {
        return XH.identityService.endImpersonateAsync()
            .then(() => {
                XH.reloadApp();
            })
            .catchDefault({
                message: 'Failed to end impersonation'
            });
    }

    //--------------------
    // Implementation
    //--------------------
    ensurePermission() {
        throwIf(!this.canImpersonate, 'User does not have right to impersonate.');
    }

    ensureTargetsLoaded() {
        if (this.targets.length) return;

        XH.identityService.getImpersonationTargetsAsync()
            .thenAction((targets) => {
                this.targets = targets;
            });
    }
}