/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel, XH} from '@xh/hoist/core';
import {allSettled, start} from '@xh/hoist/promise';
import {PendingTaskModel} from '@xh/hoist/utils/async';
import {pull} from 'lodash';

/**
 * Refresh Model.
 */
@HoistModel
export class RefreshModel {

    targets = [];

    loadModel = new PendingTaskModel();
    lastRefreshRequested = null;
    lastRefreshCompleted = null;

    //------------------------------------------
    // Application API
    //------------------------------------------
    async refreshAsync({isAutoRefresh = false} = {}) {
        this.lastRefreshRequested = new Date();
        return start(() => {
            return allSettled(this.targets.map(t => this.doRefreshAsync(t, isAutoRefresh)));
        }).finally(() => {
            this.lastRefreshCompleted = new Date();
        }).linkTo(
            this.loadModel
        );
    }

    //----------------------------------------
    // Target management
    //-----------------------------------------
    register(target) {
        const {targets} = this;
        if (!targets.includes(target)) targets.push(target);
    }

    unregister(target) {
        pull(this.targets, target);
    }

    destroy() {
        this.targets = null;
        XH.safeDestroy(this.loadModel);
    }

    //-------------------------
    // Implementation
    //-------------------------
    doRefreshAsync(target, isAutoRefresh) {
        if (target.refreshAsync)    return target.refreshAsync({isAutoRefresh});
        if (target.loadAsync)       return target.loadAsync({isAutoRefresh});
    }
}