/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed, PersistenceProvider, RefreshMode, RenderMode, XH} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {ensureNotEmpty, ensureUniqueBy, throwIf} from '@xh/hoist/utils/js';
import {find, isUndefined} from 'lodash';
import {TabModel} from './TabModel';

/**
 * Model for a TabContainer, representing its layout/contents and the currently displayed Tab.
 *
 * This object provides support for routing based navigation, customizable (lazy) mounting and
 * unmounting of inactive tabs, and customizable refreshing of tabs via a built-in RefreshContextModel.
 *
 * Note: Routing is currently enabled for desktop applications only.
 */
@HoistModel
export class TabContainerModel {

    /** @member {TabModel[]} */
    @managed tabs = [];

    /** @member {?string} */
    route;

    /** @member {string} */
    @observable activeTabId;

    /** @member {string} */
    switcherPosition;

    /** @member {boolean} */
    track;

    /** @member {RenderMode} */
    renderMode;

    /** @member {RefreshMode} */
    refreshMode;

    /**
     * @param {Object} c - TabContainerModel configuration.
     * @param {Object[]} c.tabs - configs for TabModels to be displayed.
     * @param {?string} [c.defaultTabId] - ID of Tab to be shown initially if routing does not
     *      specify otherwise. If not set, will default to first tab in the provided collection.
     * @param {?string} [c.route] - base route name for this container. If set, this container will
     *      be route-enabled, with the route for each tab being "[route]/[tab.id]".
     * @param {string} [c.switcherPosition] - Position of the switcher docked within this component.
     *      Valid values are 'top', 'bottom', 'left', 'right', or 'none' if no switcher shown.
     * @param {boolean} [c.track] - True to enable activity tracking of tab views (default false).
     * @param {RenderMode} [c.renderMode] - strategy for rendering child tabs. Can be set
     *      per-tab via `TabModel.renderMode`. See enum for description of supported modes.
     * @param {RefreshMode} [c.refreshMode] - strategy for refreshing child tabs. Can be set
     *      per-tab via `TabModel.refreshMode`. See enum for description of supported modes.
     * @param {PersistOptions} [c.persistWith] - options governing persistence.
     */
    constructor({
        tabs,
        defaultTabId = null,
        route = null,
        switcherPosition = XH.isMobileApp ? 'bottom' : 'top',
        track = false,
        renderMode = RenderMode.LAZY,
        refreshMode = RefreshMode.ON_SHOW_LAZY,
        persistWith = null
    }) {

        tabs = tabs.filter(p => !p.omit);
        ensureNotEmpty(tabs, 'TabContainerModel needs at least one child.');
        ensureUniqueBy(tabs, 'id', 'Multiple TabContainerModel tabs have the same id.');
        throwIf(!['top', 'bottom', 'left', 'right', 'none'].includes(switcherPosition), 'Unsupported value for switcherPosition.');

        this.switcherPosition = switcherPosition;
        this.renderMode = renderMode;
        this.refreshMode = refreshMode;
        this.route = route;
        this.activeTabId = this.initialActiveTabId(tabs, defaultTabId);
        this.tabs = tabs.map(p => new TabModel({...p, containerModel: this}));
        this.track = track;

        if (route) {
            if (XH.isMobileApp) {
                console.warn('Tab container routing is not supported for mobile applications.');
                return;
            }

            if (persistWith) {
                console.warn('Active tab persistance is ignored when a tab container uses routing.');
            }

            this.addReaction({
                track: () => XH.routerState,
                run: this.syncWithRouter
            });

            this.forwardRouterToTab(this.activeTabId);
        } else if (persistWith) {
            this.setupStateProvider(persistWith);
        }
    }

    /** @return {TabModel} */
    get activeTab() {
        return find(this.tabs, {id: this.activeTabId});
    }

    /** @return {?TabModel} - the tab immediately before the active tab in the model's tab list. */
    get prevTab() {
        const activeTabIdx = this.tabs.indexOf(this.activeTab);
        return activeTabIdx > 0 ? this.tabs[activeTabIdx - 1] : null;
    }

    /** @return {?TabModel} - the tab immediately after the active tab in the model's tab list. */
    get nextTab() {
        const activeTabIdx = this.tabs.indexOf(this.activeTab);
        return activeTabIdx < this.tabs.length - 1 ? this.tabs[activeTabIdx + 1] : null;
    }

    /**
     * Set the currently active Tab.
     *
     * If using routing, this method will navigate to the new tab via the router and the active Tab
     * will only be updated once the router state changes. Otherwise the active Tab will be updated
     * immediately.
     *
     * @param {string} id - unique ID of Tab to activate.
     */
    activateTab(id) {
        if (this.activeTabId === id) return;

        const tab = find(this.tabs, {id});
        if (tab.disabled) return;

        const {route} = this;
        if (route) {
            XH.navigate(route + '.' + id);
        } else {
            this.setActiveTabId(id);
        }
    }

    /** Navigate to the tab immediately before the currently active tab, if any. */
    activatePrevTab() {
        const {prevTab} = this;
        if (prevTab) this.activateTab(prevTab.id);
    }

    /** Navigate to the tab immediately after the currently active tab, if any. */
    activateNextTab() {
        const {nextTab} = this;
        if (nextTab) this.activateTab(nextTab.id);
    }

    //-------------------------
    // Implementation
    //-------------------------
    @action
    setActiveTabId(id) {
        const tab = find(this.tabs, {id});

        throwIf(!tab, `Unknown Tab ${id} in TabContainer.`);
        throwIf(tab.disabled, `Cannot activate Tab ${id} because it is disabled!`);

        this.activeTabId = id;
        this.forwardRouterToTab(id);
    }

    syncWithRouter() {
        const {tabs, route} = this,
            {router} = XH;

        if (router.isActive(route)) {
            const tab = tabs.find(t => router.isActive(route + '.' + t.id));
            if (tab && !tab.isActive && !tab.disabled) {
                this.setActiveTabId(tab.id);
            }
        }
    }

    forwardRouterToTab(id) {
        const {route} = this;
        if (route && id) {
            XH.router.forward(route, route + '.' + id);
        }
    }

    initialActiveTabId(tabConfigs, defaultTabId) {
        let ret;

        // try route
        const {route} = this, {router} = XH;
        if (route && router.isActive(route)) {
            ret = tabConfigs.find(t => router.isActive(route + '.' + t.id));
            if (ret && !ret.disabled) return ret.id;
        }

        // or default
        ret = tabConfigs.find(t => t.id == defaultTabId);
        if (ret && !ret.disabled) return ret.id;

        // or first enabled tab
        ret = tabConfigs.find(t => !t.disabled);
        if (ret) return ret.id;

        return null;
    }

    setupStateProvider(persistWith) {
        // Read state from provider -- fail gently
        let state = null;
        if (persistWith) {
            try {
                this.provider = PersistenceProvider.create({path: 'tabContainer', ...persistWith});
                state = this.provider.read() || null;
            } catch (e) {
                console.error(e);
                XH.safeDestroy(this.provider);
                this.provider = null;
            }
        }

        // Initialize state.
        if (!isUndefined(state?.activeTabId)) {
            this.activateTab(state.activeTabId);
        }

        // Attach to provider last
        if (this.provider) {
            this.addReaction({
                track: () => this.activeTabId,
                run: (activeTabId) => this.provider.write({activeTabId})
            });
        }
    }
}