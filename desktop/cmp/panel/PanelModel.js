/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {
    HoistModel,
    managed,
    ManagedRefreshContextModel,
    RefreshMode,
    RenderMode,
    XH
} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {start} from '@xh/hoist/promise';
import {apiRemoved} from '@xh/hoist/utils/js';
import {isNil} from 'lodash';
import {PersistenceProvider, PrefProvider} from '@xh/hoist/persistence';

/**
 * PanelModel supports configuration and state-management for user-driven Panel resizing and
 * expand/collapse functionality, including the option to persist such state into a Hoist
 * preference.
 */
@HoistModel
export class PanelModel {

    //-----------------------
    // Immutable Properties
    //-----------------------
    resizable;
    resizeWhileDragging;
    collapsible;
    defaultSize;
    minSize;
    maxSize;
    defaultCollapsed;
    side;
    renderMode;
    refreshMode;
    prefName;
    showSplitter;
    showSplitterCollapseButton;
    showHeaderCollapseButton;

    @managed refreshContextModel;

    //---------------------
    // Observable State
    //---------------------
    /** Is the Panel rendering in a collapsed state? */
    @observable collapsed = false;

    /** Size in pixels along sizing dimension.  Used when object is *not* collapsed. */
    @observable size = null;

    /** Is this panel currently resizing? */
    @observable isResizing = false;

    get isActive() {
        return !this.collapsed;
    }

    /**
     * @param {Object} config
     * @param {boolean} [config.resizable] - Can panel be resized?
     * @param {boolean} [config.resizeWhileDragging] - Redraw panel as resize happens?
     * @param {boolean} [config.collapsible] - Can panel be collapsed, showing only its header?
     * @param {number} config.defaultSize - Default size (in px) of the panel.
     * @param {number} [config.minSize] - Minimum size (in px) to which the panel can be resized.
     * @param {?number} [config.maxSize] - Maximum size (in px) to which the panel can be resized.
     * @param {boolean} [config.defaultCollapsed] - Default collapsed state.
     * @param {string} config.side - Side towards which the panel collapses or shrinks. This relates
     *      to the position within a parent vbox or hbox in which the panel should be placed.
     * @param {RenderMode} [config.renderMode] - How should collapsed content be rendered?
     *      Ignored if collapsible is false.
     * @param {RefreshMode} [config.refreshMode] - How should collapsed content be refreshed?
     *      Ignored if collapsible is false.
     * @param {PersistenceProvider} [c.persistWith] - PersistenceProvider or a config to create one.
     * @param {PanelModePersistOptions} [c.persistOptions] - options governing persistence.
     * @param {boolean} [config.showSplitter] - Should a splitter be rendered at the panel edge?
     * @param {boolean} [config.showSplitterCollapseButton] - Should the collapse button be visible
     *      on the splitter? Only applicable if the splitter is visible and the panel is collapsible.
     * @param {boolean} [config.showHeaderCollapseButton] - Should a collapse button be added to the
     *      end of the panel header? Only applicable if the panel is collapsible.
     */
    constructor({
        collapsible = true,
        resizable = true,
        resizeWhileDragging = false,
        defaultSize,
        minSize = 0,
        maxSize = null,
        defaultCollapsed = false,
        side,
        renderMode = RenderMode.LAZY,
        refreshMode = RefreshMode.ON_SHOW_LAZY,
        persistWith = null,
        persistOptions = null,
        showSplitter = resizable || collapsible,
        showSplitterCollapseButton = showSplitter && collapsible,
        showHeaderCollapseButton = true,
        ...rest
    }) {
        if ((collapsible || resizable) && (isNil(defaultSize) || isNil(side))) {
            console.error(
                "Must specify 'defaultSize' and 'side' for a collapsible or resizable PanelModel. Panel sizing disabled."
            );
            collapsible = false;
            resizable = false;
        }

        apiRemoved(rest.prefName, 'prefName', 'Specify "persistWith" instead.');

        if (!isNil(maxSize) && (maxSize < minSize || maxSize < defaultSize)) {
            console.error("'maxSize' must be greater than 'minSize' and 'defaultSize'. No 'maxSize' will be set.");
            maxSize = null;
        }

        this.collapsible = collapsible;
        this.resizable = resizable;
        this.resizeWhileDragging = resizeWhileDragging;
        this.defaultSize = defaultSize;
        this.minSize = Math.min(minSize, defaultSize);
        this.maxSize = maxSize;
        this.defaultCollapsed = defaultCollapsed;
        this.side = side;
        this.renderMode = renderMode;
        this.refreshMode = refreshMode;
        this.showSplitter = showSplitter;
        this.showSplitterCollapseButton = showSplitterCollapseButton;
        this.showHeaderCollapseButton = showHeaderCollapseButton;

        if (this.collapsible) {
            this.refreshContextModel = new ManagedRefreshContextModel(this);
        }

        // 1) Read state from and attach to provider -- fail gently
        if (persistWith) {
            try {
                const provider = PersistenceProvider.getOrCreate(persistWith),
                    path = this.persistOptions?.path ?? 'panelModel';

                const state = provider.read(path) ?? this.legacyState(provider, path);
                this.setSize(state?.size ?? defaultSize);
                this.setCollapsed(state?.collapsed ?? defaultCollapsed);

                this.addReaction({
                    track: () => [this.collapsed, this.size],
                    run: ([collapsed, size]) => provider.write(path, {collapsed, size}),
                    debounce: 500
                });
            } catch (e) {
                console.error(e);
                this.setSize(defaultSize);
                this.setCollapsed(defaultCollapsed);
            }
        }
    }

    //----------------------
    // Actions + public setters
    //----------------------
    @action
    setCollapsed(collapsed) {
        // When opening from collapsed position restore *default* size. This may be suboptimal
        // in some cases -- you lose user set "size" -- but avoids confusing behavior where
        // 'opening' a panel could cause it to shrink.
        if (this.collapsed === true && !collapsed) {
            this.size = this.defaultSize;
        }
        this.collapsed = collapsed;
        this.dispatchResize();
    }

    toggleCollapsed() {
        this.setCollapsed(!this.collapsed);
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

    /**
     * Enable/disable dynamic re-rendering of contents while dragging to resize.
     * @param {boolean} v
     */
    setResizeWhileDragging(v) {
        this.resizeWhileDragging = v;
    }

    //---------------------------------------------
    // Implementation (for related private classes)
    //---------------------------------------------
    get vertical() {
        return this.side === 'top' || this.side === 'bottom';
    }

    // Does the Panel come before the resizing affordances?
    get contentFirst() {
        return this.side === 'top' || this.side === 'left';
    }

    //---------------------------------------------
    // Implementation (internal)
    //---------------------------------------------
    legacyState(provider, path) {
        if (provider instanceof PrefProvider) {
            const data = XH.getPref(provider.key);
            if (data && !isNil(data.collapsed) && !isNil(data.size)) {
                provider.write(path, data);
                provider.clear('collapsed');
                provider.clear('size');
                return data;
            }
        }
        return null;
    }

    dispatchResize() {
        // Forces other components to redraw if required.
        start(() => window.dispatchEvent(new Event('resize')));
    }
}


/**
 * @typedef {Object} PanelModelPersistOptions
 * @property {string} [path] - path or key in src where state should be stored (default 'panel')
 */
