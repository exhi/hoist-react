/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {action, computed, observable} from '@xh/hoist/mobx';
import {LastPromiseModel} from '@xh/hoist/promise';
import {startCase} from 'lodash';

/**
 * Model for a TabPane - a single tab within a container - representing its content's
 * active and load/refresh state.
 *
 * This model is not typically created directly within applications. Instead, specify a
 * configuration for it via the 'panes' property of the TabContainerModel constructor.
 */
@HoistModel()
export class TabPaneModel {
    id = null;
    name = null;
    reloadOnShow = false;
    containerModel = null;

    @observable lastRefreshRequest = null;
    @observable lastLoaded = null;
    loadState = new LastPromiseModel();

    /**
     * @param {string} id - unique ID, used by parent container for generating routes.
     * @param {string} [name] - display name for the tab.
     * @param {Object} content - content to be rendered by this tab. Component class or a custom
     *      element factory of the form returned by elemFactory.
     * @param {boolean} reloadOnShow - true to reload data for this tab each time it is selected.
     */
    constructor({
        id,
        name = startCase(id),
        content,
        reloadOnShow = false
    }) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.reloadOnShow = reloadOnShow;
    }

    /**
     * Select this pane.
     */
    select() {
        this.containerModel.setActivePaneId(this.id);
    }

    /**
     * Is this pane currently active?
     */
    get isActive() {
        return this.containerModel.activePaneId === this.id;
    }

    /**
     * Require a refresh of all contents when they are next shown.
     */
    @action
    requestRefresh() {
        this.lastRefreshRequest = Date.now();
    }

    //---------------------------
    // Implementation
    //---------------------------
    @computed
    get needsLoad() {
        if (!this.isActive || this.loadState.isPending) return false;

        const {lastLoaded, lastRefreshRequest} = this;
        return (!lastLoaded || (lastRefreshRequest && (lastLoaded < lastRefreshRequest)));
    }

    @action
    markLoaded() {
        this.lastLoaded = Date.now();
    }

    destroy() {
        XH.safeDestroy(this.loadState);
    }
}
