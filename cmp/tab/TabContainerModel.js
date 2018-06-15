/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {action, computed, observable} from '@xh/hoist/mobx';
import {isPlainObject, max, startCase, uniqBy} from 'lodash';
import {throwIf} from '@xh/hoist/utils/JsUtils';
import {wait} from '@xh/hoist/promise';
import {TabPaneModel} from '@xh/hoist/cmp/tab';

/**
 * Model for a TabContainer, representing its layout/contents and the currently selected child.
 *
 * This TabContainer also supports managed loading and refreshing of its TabPanes.
 * In particular, TabPanes will be lazily rendered and loaded and can also be refreshed whenever the
 * TabPane is shown.
 * @see TabPaneModel
 *
 * By default this TabContainer will install a TabSwitcher above the TabPanes to control the
 * selected TabPane. If the switcherPosition is set to 'none' then no TabSwitcher will be installed
 * and it will be up to the application to handle setting the selected id on this TabContainerModel
 * when appropriate.
 */
@HoistModel()
export class TabContainerModel {
    id = null;
    name = null;
    switcherPosition = 'top';
    children = [];

    @observable _lastRefreshRequest = null;
    @observable selectedId = null;

    parent = null;   // For sub-tabs only

    /**
     * @param {string} id - unique ID, used for generating routes.
     * @param {string} [name] - display name for this container - useful in particular when displaying
     *      nested tabs, where this model's container is a direct child of a parent TabContainer.
     * @param {string} [switcherPosition] - specify top, left, bottom, right, or none. Defaults to top.
     * @param {boolean} [useRoutes] - true to use routes for navigation.
     *      These routes must be setup externally in the application (@see BaseApp.getRoutes()).
     *      They may exist at any level of the application, but there must be a route of the form
     *      `/../../[containerId]/[childPaneId]` for each child pane in this container.
     * @param {Object[]} children - configurations for TabPaneModels or nested TabContainerModels.
     */
    constructor({
        id,
        name = startCase(id),
        switcherPosition = 'top',
        useRoutes = false,
        children
    }) {
        this.id = id;
        this.name = name;
        this.switcherPosition = switcherPosition;
        this.useRoutes = useRoutes;

        // Instantiate children, if needed.
        children = children.map(child => {
            if (isPlainObject(child)) {
                return (child.children) ?
                    new TabContainerModel({useRoutes, ...child}) :
                    new TabPaneModel(child);
            }
            return child;
        });

        // Validate and wire children
        throwIf(children.length == 0,
            'TabContainerModel needs at least one child pane.'
        );
        throwIf(children.length != uniqBy(children, 'id').length,
            'One or more Panes in TabContainerModel has a non-unique id.'
        );

        children.forEach(child => child.parent = this);
        this.children = children;
        this.selectedId = children[0].id;
        wait(1).then(() => this.addAutorun(this.syncFromRouter));
    }

    get routeName() {
        return this.parent ? this.parent.routeName + '.' + this.id : this.id;
    }

    get vertical() {
        return this.switcherPosition === 'left' || this.switcherPosition === 'right';
    }

    @action
    setSelectedId(id) {
        const children = this.children,
            child = children.find(it => it.id === id);
        
        this.selectedId = child ? id : children[0].id;

        if (child.reloadOnShow) child.requestRefresh();

        if (this.useRoutes) {
            const routerModel = XH.routerModel,
                state = routerModel.currentState,
                routeName = state ? state.name : 'default',
                selectedRouteFragment = this.routeName + '.' + this.selectedId;

            if (!routeName.startsWith(selectedRouteFragment)) {
                routerModel.navigate(selectedRouteFragment);
            }
        }
    }

    @computed
    get isActive() {
        const parent = this.parent;
        return !parent || (parent.selectedId === this.id && parent.isActive);
    }

    @action
    requestRefresh() {
        this._lastRefreshRequest = Date.now();
    }

    @computed
    get lastRefreshRequest() {
        const parentVal = this.parent && this.parent.lastRefreshRequest;
        return max([parentVal, this._lastRefreshRequest]);
    }

    //-------------------------
    // Implementation
    //-------------------------
    syncFromRouter() {
        if (!this.useRoutes) return;

        const {parent, id} = this,
            routerModel = XH.routerModel,
            state = routerModel.currentState,
            routeName = state ? state.name : 'default';
        
        if (parent && routeName.startsWith(this.routeName) && parent.selectedId != id) {
            parent.setSelectedId(id);
        }
    }

    destroy() {
        XH.safeDestroy(...this.children);
    }
}