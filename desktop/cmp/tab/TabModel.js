/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {action, bindable, observable} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';
import {startCase} from 'lodash';

import {TabRefreshContextModel} from './impl/TabRefreshContextModel';

/**
 * Model for a Tab within a TabContainer - manages the active and refresh state of its contents.
 *
 * This model is not typically created directly within applications. Instead, specify a
 * configuration for it via the `TabContainerModel.tabs` constructor config.
 */
@HoistModel
export class TabModel {
    id;
    @bindable title;
    @observable disabled;

    excludeFromSwitcher;

    containerModel = null;

    @managed
    refreshContextModel = null;

    /**
     * @param {Object} c - TabModel configuration.
     * @param {string} c.id - unique ID, used by container for locating tabs and generating routes.
     * @param {TabContainerModel} c.containerModel - owner TabContainerModel.
     * @param {string} [c.title] - display title for the Tab in the container's TabSwitcher.
     * @param {string} [c.disabled] - whether this tab should appear disabled in the container's TabSwitcher.
     * @param {string} [c.excludeFromSwitcher] - set to true to hide this Tab in the container's TabSwitcher, but still be able to activate the tab manually or via routing
     * @param {Object} c.content - content to be rendered by this Tab. Component class or a custom
     *      element factory of the form returned by elemFactory.
     * @param {?string} [c.renderMode] - how to render hidden tabs - [always|lazy|unmountOnHide].
     * @param {?string} [c.refreshMode] - how to refresh hidden tabs - [always|skipHidden|onShowLazy|onShowAlways].
     */
    constructor({
        id,
        containerModel,
        title = startCase(id),
        disabled,
        excludeFromSwitcher,
        content,
        refreshMode,
        renderMode
    }) {
        this.id = id;
        this.containerModel = containerModel;
        this.title = title;
        this.disabled = !!disabled;
        this.excludeFromSwitcher = excludeFromSwitcher;
        this.content = content;
        this._renderMode = renderMode;
        this._refreshMode = refreshMode;

        this.refreshContextModel = new TabRefreshContextModel(this);
    }

    activate() {
        this.containerModel.activateTab(this.id);
    }

    get renderMode()     {return this._renderMode || this.containerModel.renderMode}

    get refreshMode()    {return this._refreshMode || this.containerModel.refreshMode}
    
    get isActive() {
        return this.containerModel.activeTabId === this.id;
    }
    
    @action
    setDisabled(disabled) {
        if (disabled && this.isActive) {
            const {containerModel} = this,
                tab = containerModel.tabs.find(tab => tab.id !== this.id && !tab.disabled);

            throwIf(!tab, 'Cannot disable last enabled tab.');
            containerModel.activateTab(tab.id);
        }

        this.disabled = disabled;
    }
}
