/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {ONE_SECOND} from '@xh/hoist/utils/DateTimeUtils';
import {withDefault} from '@xh/hoist/utils/JsUtils';
import {start} from '@xh/hoist/promise';

/**
 * This class provides the underlying state for Components that can be resized or collapsed by the user.
 *
 * See also SizingSupport.
 */
@HoistModel
export class SizingModel {

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
    /** Is the related content rendering in a collapsed state? */
    @observable collapsed;

    /** Size in pixels along sizing dimension.  Used when object is *not* collapsed. */
    @observable size = null;

    /** Is this object currently resizing? */
    @observable isResizing = false;

    /**
     * @param {Object} config
     * @param {boolean} [config.resizable] - Can content be resized ?
     * @param {boolean} [config.collapsible] - Can content be fully collapsed?
     * @param {int} config.defaultSize - Default size of content (in pixels).
     * @param {int} [config.defaultCollapsed] - Default collapsed state.
     * @param {string} [config.side] - Side of Panel which it collapses to, or shrinks toward.
     * @param {string} [config.collapsedRenderMode] - How should collapsed content be rendered?
     *      Valid values include 'lazy', 'always', and 'unmountOnHide'.
     * @param {string} [config.prefName] - preference name to store sizing and collapsed state for this component.
     */
    constructor({
        collapsible = true,
        resizable = true,
        defaultSize,
        defaultCollapsed = false,
        side ='top',
        collapsedRenderMode = 'lazy',
        prefName = null
    }) {
        // Set immutables
        this.collapsible = collapsible;
        this.resizable = resizable;
        this.defaultSize = defaultSize;
        this.defaultCollapsed = defaultCollapsed;
        this.side = side;
        this.collapsedRenderMode = collapsedRenderMode;

        if (prefName && !XH.prefService.hasKey(prefName)) {
            console.warn(`Unknown preference for storing state of SizableComponent '${prefName}'`);
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
        // When opening from collapsed position restore *default* size.  This ay be a suboptimal in some cases
        // (you lose user "size"), but avoids confusing behavior where 'opening' a panel could cause it to shrink.
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
    setIsResizing(isResizing) {
        this.isResizing = isResizing;
        if (!isResizing) this.dispatchResize();
    }

    toggleCollapsed() {
        this.setCollapsed(!this.collapsed);
    }

    //------------------
    // Implementation
    //------------------
    prefReaction() {
        return {
            track: () => [this.collapsed, this.size],
            run: (collapsed, size) => XH.setPref(this.prefName, {collapsed, size}),
            delay: 500   // prefs are already batched, keep tight.
        };
    }

    dispatchResize() {
        // Forces other components to redraw if required.
        start(() => window.dispatchEvent(new Event('resize')));
    }
}