/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel, managed, RenderMode, RefreshMode} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {isPlainObject, isString, isNumber, isFinite, isNil, endsWith, assign} from 'lodash';
import {throwIf} from '@xh/hoist/utils/js';
import {DialogStateModel} from './DialogStateModel';

/**
 * Main backing Model for Dialog Component.
 *
 * Provides the API for configuration and run-time manipulation of the Dialog's positioning
 * and other state.
 */
@HoistModel
export class DialogModel {

    /** @member {DialogStateModel} */
    @managed
    stateModel;

    //-----------------------
    // Immutable Properties
    //-----------------------
    /** @member {boolean} */
    resizable;
    /** @member {boolean} */
    draggable;
    /** @member {boolean} */
    closeOnOutsideClick;
    /** @member {boolean} */
    closeOnEscape;
    /** @member {boolean} */
    showCloseButton;
    /** @member {boolean} */
    showBackgroundMask;
    /** @member {boolean} */
    inPortal;
    /** @member {RenderMode} */
    renderMode;
    /** @member {RefreshMode} */
    refreshMode;


    //---------------------------------
    // Observable/Settable Public State
    //----------------------------------
    /**
     * @member {Size} - Desired width and height (when not maximized).
     * Null or undefined values in either dimension indicate dialog should take natural
     * size of content in that dimension.
     */
    @observable.ref size;

    /**
     * @member {Position} - Desired position of top-left corner (when not maximized).
     * Null or undefined values in either dimension indicate dialog should be centered
     * along that dimension.
     */
    @observable.ref position;

    /** @member {boolean} - is the Dialog visible (i.e. rendered) */
    @observable isOpen;

    /** @member {boolean} - is the Dialog maximized within its parent. */
    @observable isMaximized;

    //------------------------
    // Read-only Public State
    //------------------------
    /**
     * @member {Size} - Rendered width and height.
     */
    @observable.ref renderedSize;

    /**
     * @member {Position} - Rendered position of top-left corner.
     */
    @observable.ref renderedPosition;

    /**
     * @param {Object} config
     * @param {boolean} [config.resizable] - true to add draggable borders.
     * @param {boolean} [config.draggable] - true to allow dragging the dialog via its title bar.
     * @param {boolean} [config.closeOnOutsideClick] - true to allow closing by clicking outside dialog.
     * @param {boolean} [config.closeOnEscape] - true to allow closing by pressing escape key
     * @param {boolean} [config.showCloseButton] - true to show close button in header.
     * @param {boolean} [config.showBackgroundMask] - true to show a background mask.
     * @param {boolean} [config.inPortal] - Open in portal?  If true dialog will be positioned with
     *      respect to the entire Viewport.  If false, dialog will be bound by parent DOM element.
     * @param {Size} [config.size] - initial (unmaximized) size
     * @param {Position} [config.position] - initial (unmaximized) position.
     * @param {boolean} [config.isOpen] - Is dialog open?
     * @param {boolean} [config.isMaximized] - Does dialog cover entire viewport?
     * @param {RenderMode} [c.renderMode] - strategy for rendering closed dialog.
     * @param {RefreshMode} [c.refreshMode] - strategy for refreshing closed dialog.
     *      See enum for description of supported modes.
     * @param {(Object|string)} [config.stateModel] - config or string for a DialogStateModel.
     * @param {function} [config.onOpen] - callback function to run when dialog is opened.
     * @param {function} [config.onClose] - callback function to run when dialog is closed.
     */
    constructor({
        resizable = false,
        draggable = false,
        closeOnOutsideClick = true,
        closeOnEscape = true,
        showCloseButton = true,
        showBackgroundMask = true,
        inPortal = true,

        size,
        position,
        isOpen = true,
        isMaximized = false,
        renderMode = RenderMode.LAZY,
        refreshMode = RefreshMode.ON_SHOW_LAZY,

        stateModel = null,
        onClose = null,
        onOpen = null
    } = {}) {

        // Set immutables
        this.inPortal = inPortal;
        this.showBackgroundMask = showBackgroundMask;
        this.showCloseButton = showCloseButton;
        this.resizable = resizable;
        this.draggable = draggable;
        this.closeOnOutsideClick = closeOnOutsideClick;
        this.closeOnEscape = closeOnEscape;
        this.renderMode = renderMode;
        this.refreshMode = refreshMode;

        // set observables
        this.setSize(size);
        this.setPosition(position);
        this.isOpen = isOpen;
        this.isMaximized = isMaximized;

        // Other
        this.stateModel = this.parseStateModel(stateModel);
        if (onClose || onOpen) {
            this.addReaction({
                track: () => this.isOpen,
                run: (isOpen) => isOpen ? onOpen?.call() : onClose?.call()
            });
        }
    }

    //----------------------
    // Public Methods
    //----------------------
    /**
     * Open the Dialog, if not already open.
     */
    @action
    open() {
        this.isOpen = true;
    }

    /**
     * Close the Dialog, if open.
     */
    @action
    close() {
        this.isOpen = false;
    }

    /**
     * Maximize the dialog to take up the entire size of its parent.
     */
    @action
    maximize() {
        this.isMaximized = true;
    }

    /**
     * Restore a maximized dialog back to its unmaximized state.
     */
    @action
    restore() {
        this.isMaximized = false;
    }

    /**
     * Maximize or restore as appropriate.
     */
    @action
    toggleMaximized() {
        this.isMaximized = !this.isMaximized;
    }

    /**
     * Set the (unmaximized) position of the dialog.
     */
    @action
    setPosition({x, y} = {}) {
        this.position = assign(
            {x: undefined, y: undefined},
            this.position,
            {x: this.parseCoordinate(x), y: this.parseCoordinate(y)}
        );
    }

    /**
     * Set the (unmaximized) size of the dialog.
     */
    @action
    setSize({width, height} = {}) {
        this.size = assign(
            {width: undefined, height: undefined},
            this.size,
            {width: this.parseDim(width), height: this.parseDim(height)}
        );
    }

    //-----------------
    // Implementation
    //-----------------
    parseStateModel(stateModel) {
        let ret = null;
        if (isPlainObject(stateModel)) {
            ret = new DialogStateModel(stateModel);
        } else if (isString(stateModel)) {
            ret = new DialogStateModel({dialogId: stateModel});
        }
        if (ret) {
            ret.init(this);
        }
        return ret;
    }

    parseDim(val) {
        if (isNumber(val)) {
            throwIf(
                !isFinite(val) || val < 0,
                'Dimension must be a positive number.'
            );
        } else if (isString(val)) {
            const numb = parseInt(val);
            throwIf(
                !endsWith(val, '%') || !isFinite(numb) || numb > 100 || numb < 0,
                'String Dimension must be a percentage between 0 and 100.'
            );
        } else if (!isNil(val)) {
            throw XH.exception('Incorrect dimension value.');
        }
        return val;
    }

    parseCoordinate(val) {
        if (isNumber(val)) {
            throwIf(
                !isFinite(val) || val < 0,
                'Position Co-ordinate must be a number greater than or equal to zero.'
            );
        } else if (!isNil(val)) {
            throw XH.exception('Incorrect position co-ordinate.');
        }
        return val;
    }


    @action
    noteRendered(size, position) {
        this.renderedSize = size;
        this.renderedPosition = position;
    }
}


/**
 * @typedef {Object} Size
 * @property {(number|String)} width - pixel count or string percentage between '0%' and '100%'.
 * @property {(number|String)} height - pixel count or string percentage between '0%' and '100%'.
 */


/**
 * @typedef {Object} Position
 * @property {number} x - x co-ordinate from top-left corner of parent.
 * @property {number} y - y co-ordinate of top-left corner of parent
 */