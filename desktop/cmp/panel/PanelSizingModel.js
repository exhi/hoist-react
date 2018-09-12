/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {withDefault, throwIf} from '@xh/hoist/utils/js';
import {start} from '@xh/hoist/promise';
import {isNil} from 'lodash';


/**
 * This class provides the underlying state for the resizing/collapse state of a Panel.
 */
@HoistModel
export class PanelSizingModel {

    //-----------------------
    // Immutable Properties
    //-----------------------
    resizable;
    collapsible;
    defaultSize;
    defaultCollapsed;
    side;
    collapsedRenderMode;
    prefName;

    //---------------------
    // Observable State
    //---------------------
    /** Is the Panel rendering in a collapsed state? */
    @observable collapsed;

    /** Size in pixels along sizing dimension.  Used when object is *not* collapsed. */
    @observable size = null;

    /** Is this panel currently resizing? */
    @observable isResizing = false;

    /**
     * @param {Object} config
     * @param {boolean} [config.resizable] - Can panel be resized?
     * @param {boolean} [config.collapsible] - Can panel be collapsed, showing only its header?
     * @param {number} config.defaultSize - Default size of content (in pixels).
     * @param {number} [config.defaultCollapsed] - Default collapsed state.
     * @param {string} config.side - Side of panel that it collapses/shrinks toward. This also corresponds
     *      to the position within a parent vbox or hbox in which the panel should be placed.
     * @param {string} [config.collapsedRenderMode] - How should collapsed content be rendered?
     *      Valid values include 'lazy', 'always', and 'unmountOnHide'.
     * @param {string} [config.prefName] - preference name to store sizing and collapsed state.
     */
    constructor({
        collapsible = true,
        resizable = true,
        defaultSize,
        defaultCollapsed = false,
        side,
        collapsedRenderMode = 'lazy',
        prefName = null
    }) {
        throwIf(isNil(defaultSize) || isNil(side), "Must specify 'defaultSize' and 'side' for PanelSizingModel");

        // Set immutables
        this.collapsible = collapsible;
        this.resizable = resizable;
        this.defaultSize = defaultSize;
        this.defaultCollapsed = defaultCollapsed;
        this.side = side;
        this.collapsedRenderMode = collapsedRenderMode;

        if (prefName && !XH.prefService.hasKey(prefName)) {
            console.warn(`Unknown preference for storing state of Panel '${prefName}'`);
            prefName = null;
        }
        this.prefName = prefName;

        // Set observable state
        const initial = prefName ? XH.getPref(prefName) : {};
        this.setSize(withDefault(initial.size, defaultSize));
        this.setCollapsed(withDefault(initial.collapsed, defaultCollapsed));

        if (prefName) {
            this.addReaction(this.prefReaction());
        }
    }

    //----------------------
    // Actions
    //----------------------
    @action
    setCollapsed(collapsed) {
        // When opening from collapsed position restore *default* size.  This may be suboptimal in some cases
        // -- you lose user set "size" -- but avoids confusing behavior where 'opening' a panel could cause it to shrink.
        if (this.collapsed === true && !collapsed) {
            this.size = this.defaultSize;
        }
        this.collapsed = collapsed;
        this.dispatchResize();
    }
    @action
    setSize(v) {
        this.size = v;
    }

    @action
    setIsResizing(v) {
        this.isResizing = v;
        if (!v) this.dispatchResize();
    }

    toggleCollapsed() {
        this.setCollapsed(!this.collapsed);
    }

    //---------------------------------------------
    // Implementation (for related private classes)
    //---------------------------------------------
    get vertical()              {
        return this.side === 'top' || this.side === 'bottom';
    }

    // Does the Panel come before the resizing affordances?
    get contentFirst()          {
        return this.side === 'top' || this.side === 'left';
    }
    
    //---------------------------------------------
    // Implementation (internal)
    //---------------------------------------------
    prefReaction() {
        return {
            track: () => [this.collapsed, this.size],
            run: ([collapsed, size]) => XH.setPref(this.prefName, {collapsed, size}),
            delay: 500   // prefs are already batched, keep tight.
        };
    }

    dispatchResize() {
        // Forces other components to redraw if required.
        start(() => window.dispatchEvent(new Event('resize')));
    }
}