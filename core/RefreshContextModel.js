/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed}  from '@xh/hoist/core';
import {allSettled, start} from '@xh/hoist/promise';
import {PendingTaskModel} from '@xh/hoist/utils/async';
import {throwIf} from '@xh/hoist/utils/js';
import {pull} from 'lodash';

/**
 * Model to manage refreshing sections of the application, where "refreshing" refers to app-specific
 * actions to load and display updated data. Calling `refreshAsync()` on this model will cause it to
 * trigger a refresh on all linked models within the graphical hierarchy it contains.
 *
 * A global instance of this class is provided by the framework as `XH.refreshContextModel`. Apps
 * can create additional sub-contexts using a RefreshContextView.
 *
 * Note that TabContainer automatically establishes separate refresh contexts for its tabs and uses
 * these to implement efficient refresh handling of inactive and not-yet-rendered tabs. See the
 * `refreshMode` configs on `TabContainerModel` and `TabModel` for more information on this common
 * use case.
 *
 * @see RefreshContext
 * @see RefreshContextView
 */
@HoistModel
export class RefreshContextModel {

    targets = [];

    @managed
    loadModel = new PendingTaskModel();

    lastRefreshRequested = null;
    lastRefreshCompleted = null;

    refreshAsync({isAutoRefresh = false} = {}) {
        this.lastRefreshRequested = new Date();
        return start(() => {
            return allSettled(this.targets.map(t => t.refreshAsync({isAutoRefresh})));
        }).finally(() => {
            this.lastRefreshCompleted = new Date();
        }).linkTo(
            this.loadModel
        );
    }

    /**
     * Register a HoistModel with this model for refreshing.
     *
     * For models backing HoistComponents, consider applying the `@LoadSupport` decorator to
     * the component to have this method called automatically for the component's primary model.
     *
     * @param {HoistModel} target
     */
    register(target) {
        throwIf(!target.isHoistModel, 'Cannot register non-HoistModel with RefreshContextModel.');
        const {targets} = this;
        if (!targets.includes(target)) targets.push(target);
    }

    /**
     * Unregister a HoistModel from this model.
     *
     * For models backing HoistComponents, consider applying the `@LoadSupport` decorator to
     * the component to have this method called automatically for the component's primary model.
     *
     * @param {HoistModel} target
     */
    unregister(target) {
        pull(this.targets, target);
    }
}