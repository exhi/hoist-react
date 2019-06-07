/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {HoistModel, XH} from '@xh/hoist/core';
import {action, bindable, observable} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';
import {
    cloneDeep,
    compact,
    difference,
    isArray,
    isEmpty,
    isEqual,
    isString,
    keys,
    pullAllWith,
    sortBy,
    without
} from 'lodash';

/**
 * This model is responsible for managing the state of a DimensionChooser component,
 * which allows a user to a list of dimensions for any grouping based API. It produces an
 * observable list of strings which represents a dimension grouping.
 *
 * To connect this model to an application:
 *  1) Create a new instance of this model with a list of dimensions.
 *  2) To persist user history, create an application preference with type 'JSON' and
 *     pass its key to this model.
 *  3) Track this model's 'value' property and fetch new data when it updates.
 */
@HoistModel
export class DimensionChooserModel {

    @observable.ref value = null;

    // Immutable properties
    maxHistoryLength = null;
    maxDepth = null;
    historyPreference = null;
    dimensions = null;
    dimensionVals = null;
    enableClear = false;

    // Internal state
    history = null;
    @observable.ref pendingValue = null;

    //-------------------------
    // Popover rendering
    //-------------------------
    @bindable isMenuOpen = false;
    @bindable showAddSelect = false;
    @bindable activeMode = 'history'; // history vs. edit

    /**
     * @param c - DimensionChooserModel configuration.
     * @param {string[]|Object[]} c.dimensions - dimensions available for selection. The object
     *      form supports value, label, and leaf keys, where `leaf: true` indicates that the
     *      dimension does not support any further sub-groupings.
     * @param {string[]} [c.initialValue] - initial dimensions if history empty / not configured.
     * @param {string} [c.historyPreference] - preference key used to persist the user's most
     *      recently selected groupings for easy re-selection.
     * @param {number} [c.maxHistoryLength] - number of recent selections to maintain in the user's
     *      history (maintained automatically by the control on a FIFO basis).
     * @param {number} [c.maxDepth] - maximum number of dimensions allowed in a single grouping.
     * @param {boolean} [c.enableClear] - Support clearing the control by removing all dimensions?
     */
    constructor({
        dimensions,
        initialValue,
        historyPreference,
        maxHistoryLength = 5,
        maxDepth = 4,
        enableClear = false
    }) {
        this.maxHistoryLength = maxHistoryLength;
        this.maxDepth = maxDepth;
        this.historyPreference = historyPreference;
        this.enableClear = enableClear;
        
        this.dimensions = this.normalizeDimensions(dimensions);
        this.dimensionVals = keys(this.dimensions);
        this.history = this.loadHistory();


        // Set control's initial value with priorities
        //  history -> initialValue -> 1st item or []
        if (!this.validateValue(initialValue)) {
            initialValue = enableClear || isEmpty(this.dimensionVals) ?  [] : [this.dimensionVals[0]];
        }

        this.value = this.pendingValue = !isEmpty(this.history) ? this.history[0] : initialValue;
    }

    @action
    setValue(value) {
        if (!this.validateValue(value)) {
            console.warn('Attempted to set DimChooser to invalid value: ' + value);
            return;
        }
        this.value = value;
        this.addToHistory(value);
    }

    showHistory() {
        this.setActiveMode('history');
    }

    @action
    showEditor() {
        this.pendingValue = this.value;
        this.setShowAddSelect(false);
        this.setActiveMode('edit');
    }

    showMenu() {
        if (isEmpty(this.history)) {
            this.showEditor();
        } else {
            this.showHistory();
        }
        this.setIsMenuOpen(true);
    }

    closeMenu() {
        this.setIsMenuOpen(false);
    }


    //------------------------
    // Editor support
    //------------------------
    @action
    addPendingDim(dim, level) {
        const newValue = without(this.pendingValue, dim);               // Ensure the new dimension hasn't been selected at another level
        newValue[level] = dim;                                          // Insert the new dimension
        if (this.dimensions[dim].leaf) newValue.splice(level + 1);      // If it's a leaf dimension, remove any subordinate dimensions

        this.pendingValue = newValue;                                   // Update intermediate state
        this.setShowAddSelect(false);
    }

    @action
    removePendingDim(dim) {
        this.pendingValue = without(this.pendingValue, dim);
    }

    @action
    commitPendingValueAndClose() {
        this.setValue(this.pendingValue);
        this.closeMenu();
    }

    // True if a leaf-level dim has been specified via the editor - any further child groupings
    // would be derivative at this point and should not be allowed by the UI.
    get leafInPending() {
        this.pendingValue.some(dim => this.dimensions[dim].leaf);
    }

    // Returns options passed to the select control at each level of the add menu.
    // Pass current value as second arg to ensure included - used when editing a level (vs. adding).
    dimOptionsForLevel(level, currDimVal = null) {
        // Dimensions which do not appear in the add menu
        const remainingDims = difference(this.dimensionVals, this.pendingValue);

        // Dimensions subordinate to this one in the tree hierarchy
        const childDims = this.pendingValue.slice(level + 1) || [];

        const ret = compact([...remainingDims, ...childDims, currDimVal]).map(it => this.dimensions[it]);
        return sortBy(ret, 'label');
    }


    //-------------------------
    // Implementation
    //-------------------------
    loadHistory() {
        const {historyPreference} = this,
            {prefService} = XH;

        throwIf(
            historyPreference && !prefService.hasKey(historyPreference),
            `Dimension Chooser configured with missing history preference key: '${historyPreference}'`
        );

        const history = historyPreference ? cloneDeep(prefService.get(historyPreference)) : [];
        return isEmpty(history) ? [] : history.filter(v => this.validateValue(v));
    }

    validateValue(value) {
        return value == null || (isArray(value) && value.every(h => this.dimensionVals.includes(h)));
    }

    addToHistory(value) {
        const {history, historyPreference} = this,
            {prefService} = XH;

        pullAllWith(history, [value], isEqual); // Remove duplicates

        history.unshift(value);
        if (history.length > this.maxHistoryLength) history.pop();

        if (prefService.hasKey(historyPreference)) {
            prefService.set(historyPreference, history);
        }
    }

    //-------------------------
    // Value handling
    //-------------------------
    normalizeDimensions(dims) {
        dims = dims || [];
        const ret = {};
        dims.forEach(it => {
            const dim = this.createDimension(it);
            ret[dim.value] = dim;
        });
        return ret;
    }

    createDimension(src) {
        src = isString(src) ? {value: src} : src;

        throwIf(
            !src.hasOwnProperty('value'),
            "Dimensions provided as Objects must define a 'value' property."
        );
        return {label: src.value, leaf: false, ...src};
    }
}