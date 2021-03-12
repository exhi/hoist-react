/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistModel} from '@xh/hoist/core';
import {action, bindable, computed, observable, makeObservable} from '@xh/hoist/mobx';
import {throwIf, withDefault} from '@xh/hoist/utils/js';
import {numberRenderer} from '@xh/hoist/format';
import {cloneDeep, get, isEmpty, isFinite, partition, set, sumBy, unset, sortBy} from 'lodash';

/**
 * Core Model for a TreeMap.
 *
 * You should specify the TreeMap's data store, in addition to which Record fields should be
 * mapped to label (a node's display name), value (a node's size), and heat (a node's color).
 *
 * Can also (optionally) be bound to a GridModel. This will enable selection syncing and
 * expand / collapse syncing for GridModels in `treeMode`.
 *
 * Supports any Highcharts TreeMap algorithm ('squarified', 'sliceAndDice', 'stripes' or 'strip').
 *
 * Node colors are normalized to a 0-1 range and mapped to a colorAxis via the following colorModes:
 * 'linear' distributes normalized color values across the colorAxis according to the heatField.
 * 'balanced' attempts to account for outliers by adjusting normalisation ranges around the median.
 * 'none' will ignore the colorAxis, and instead use the flat color.
 *
 * Color customization can be managed by setting colorAxis stops via the `highchartsConfig`.
 * @see Dark and Light themes for colorAxis example.
 *
 * @see https://www.highcharts.com/docs/chart-and-series-types/treemap for Highcharts config options
 */
export class TreeMapModel extends HoistModel {

    //------------------------
    // Immutable public properties
    //------------------------
    /** @member {Store} */
    store;
    /** @member {GridModel} */
    gridModel;
    /** @member {number} */
    maxNodes;
    /** @member {function} */
    valueRenderer;
    /** @member {function} */
    heatRenderer;
    /** @member {function} */
    onClick;
    /** @member {function} */
    onDoubleClick;
    /** @member {(boolean|TreeMapModel~tooltipFn)} */
    tooltip;
    /** @member {string} */
    emptyText;

    //------------------------
    // Observable API
    //------------------------
    /** @member {Object} */
    @bindable.ref highchartsConfig = {};
    /** @member {TreeMapRecord[]} */
    @observable.ref data = [];
    /** @member {string} */
    @bindable labelField;
    /** @member {string} */
    @bindable valueField;
    /** @member {string} */
    @bindable heatField;
    /** @member {number} */
    @bindable maxDepth;
    /** @member {string} */
    @bindable algorithm;
    /** @member {string} */
    @bindable colorMode;
    /** @member {boolean} */
    @bindable isResizing;

    _filter;

    /**
     * @param {Object} c - TreeMapModel configuration.
     * @param {Store} [c.store] - A store containing records to be displayed.
     * @param {GridModel} [c.gridModel] - Optional GridModel to bind to.
     * @param {number} [c.maxNodes] - Maximum number of nodes to render. Be aware that increasing
     *     this can severely degrade performance.
     * @param {Object} [c.highchartsConfig] - Highcharts configuration object for the managed
     *     map. Will be recursively merged into the top-level HC config generated by this
     *     model, the component, and the light/dark Hoist themes.
     * @param {string} c.labelField - Record field to use to determine node label.
     * @param {string} c.valueField - Record field to use to determine node size.
     * @param {string} c.heatField - Record field to use to determine node color.
     * @param {function} [c.valueRenderer] - Renderer to use when displaying value in the default tooltip.
     * @param {function} [c.heatRenderer] - Renderer to use when displaying heat in the default tooltip.
     * @param {number} [c.maxDepth] - Maximum tree depth to render.
     * @param {string} [c.algorithm] - Layout algorithm to use. Either 'squarified',
     *     'sliceAndDice', 'stripes' or 'strip'. Defaults to 'squarified'.
     *     {@see https://www.highcharts.com/docs/chart-and-series-types/treemap} for examples.
     * @param {string} [c.colorMode] - Heat color distribution mode. Either 'linear', 'balanced' or
     *     'none'. Defaults to 'linear'.
     * @param {function} [c.onClick] - Callback to call when a node is clicked. Receives (record,
     *     e). If not provided, by default will select a record when using a GridModel.
     * @param {function} [c.onDoubleClick] - Callback to call when a node is double clicked.
     *     Receives (record, e). If not provided, by default will expand / collapse a record when
     *     using a GridModel.
     * @param {(boolean|TreeMapModel~tooltipFn)} [c.tooltip] - 'true' to use the default tooltip
     *     renderer, or a custom tooltipFn which returns a string output of the node's value.
     * @param {(Element|string)} [c.emptyText] - Element/text to render if TreeMap has no records.
     *      Defaults to null, in which case no empty text will be shown.
     */
    constructor({
        store,
        gridModel,
        maxNodes = 1000,
        highchartsConfig,
        labelField = 'name',
        valueField = 'value',
        heatField = 'value',
        valueRenderer = numberRenderer(),
        heatRenderer = numberRenderer(),
        maxDepth,
        algorithm = 'squarified',
        colorMode = 'linear',
        onClick,
        onDoubleClick,
        tooltip = true,
        emptyText,
        filter
    } = {}) {
        super();
        makeObservable(this);
        this.gridModel = gridModel;
        this.store = store ? store : gridModel ? gridModel.store : null;
        throwIf(!this.store,  'TreeMapModel requires either a Store or a GridModel');
        this.maxNodes = maxNodes;

        this.highchartsConfig = highchartsConfig;
        this.labelField = labelField;
        this.valueField = valueField;
        this.heatField = heatField;
        this.valueRenderer = valueRenderer;
        this.heatRenderer = heatRenderer;
        this.maxDepth = maxDepth;

        throwIf(!['sliceAndDice', 'stripes', 'squarified', 'strip'].includes(algorithm), `Algorithm "${algorithm}" not recognised.`);
        this.algorithm = algorithm;

        throwIf(!['linear', 'balanced', 'none'].includes(colorMode), `Color mode "${colorMode}" not recognised.`);
        this.colorMode = colorMode;

        this.onClick = withDefault(onClick, this.defaultOnClick);
        this.onDoubleClick = withDefault(onDoubleClick, this.defaultOnDoubleClick);
        this.tooltip = tooltip;
        this.emptyText = emptyText;

        this._filter = filter;

        this.addReaction({
            track: () => [
                this.store.rootRecords,
                this.expandState,
                this.colorMode,
                this.labelField,
                this.valueField,
                this.heatField,
                this.maxDepth
            ],
            run: ([rawData]) => {
                this.processAndSetData(rawData);
            },
            debounce: 100,
            fireImmediately: true
        });
    }

    @computed
    get total() {
        const {valueField} = this;
        return sumBy(this.store.rootRecords, record => {
            if (this._filter && !this._filter(record)) return 0;
            return Math.abs(record.data[valueField]);
        });
    }

    @computed
    get valueFieldLabel() {
        const field = this.store.getField(this.valueField);
        return field ? field.displayName : this.valueField;
    }

    @computed
    get heatFieldLabel() {
        const field = this.store.getField(this.heatField);
        return field ? field.displayName : this.heatField;
    }

    get selectedIds() {
        return this.gridModel?.selModel.ids ?? [];
    }

    @computed
    get expandState() {
        const {gridModel} = this;
        return gridModel?.treeMode ? gridModel.expandState : {};
    }

    @computed
    get hasData() {
        return !isEmpty(this.data);
    }

    @computed
    get error() {
        return (this.data.length > this.maxNodes) ?
            'Data node limit reached. Unable to render TreeMap.' :
            null;
    }

    //-------------------------
    // Data
    //-------------------------
    @action
    processAndSetData(sourceRecords) {
        const ret = this.processRecordsRecursive(sourceRecords);
        this.data = this.normaliseColorValues(ret);
    }

    /**
     * Create a flat list of TreeMapRecords from hierarchical store data, ready to be
     * passed to HighCharts for rendering. Drilldown children are included according
     * to the bound GridModel's expandState.
     */
    processRecordsRecursive(sourceRecords, parentId = null, depth = 1) {
        const {labelField, valueField, heatField, maxDepth} = this,
            ret = [];

        sourceRecords.forEach(record => {
            const {id, children, data, treePath} = record,
                name = data[labelField],
                value = data[valueField],
                heatValue = data[heatField];

            // Skip records without value
            if (!value) return;

            // Create TreeMapRecord
            const treeRec = {
                id,
                record,
                name,
                heatValue,
                value: Math.abs(value)
            };

            if (parentId) treeRec.parent = parentId;

            // Process children if:
            // a) There are children
            // b) This node is expanded
            // c) The children do not exceed any specified maxDepth
            let childTreeRecs = [];
            if (children && this.nodeIsExpanded(treePath) && (!maxDepth || depth < maxDepth)) {
                childTreeRecs = this.processRecordsRecursive(children, id, depth + 1);
            }

            // Include record and its children if:
            // a) There is no filter
            // b) There is a filter and the record passes it
            // c) There is a filter and any of its children passes it
            if (!this._filter || this._filter(record) || childTreeRecs.length) {
                ret.push(treeRec);
                ret.push(...childTreeRecs);
            }
        });

        return ret;
    }

    /**
     * Normalizes heatValues to colorValues between 0-1, where 0 is the maximum negative heat,
     * 1 is the maximum positive heat, and 0.5 is no heat. This allows the colorValue to map to
     * the colorAxis provided to Highcharts.
     *
     * Takes the colorMode into account:
     * a) 'linear' distributes normalized color values across the colorAxis.
     * b) 'balanced' attempts to account for outliers by adjusting the normalisation ranges around
     *  the median values. Can result in more defined color differences in a dataset that is skewed
     *  by a few nodes at the extremes.
     */
    normaliseColorValues(data) {
        const {colorMode, heatField} = this;
        if (!data.length || colorMode === 'none') return data;

        // 1) Extract valid heat values
        const heatValues = [];
        this.store.records.forEach(it => {
            const val = it.get(heatField);
            if (this.valueIsValid(val)) heatValues.push(val);
        });

        // 2) Split heat values into positive and negative
        let [posHeatValues, negHeatValues] = partition(heatValues, it => it > 0);
        posHeatValues = sortBy(posHeatValues);
        negHeatValues = sortBy(negHeatValues.map(Math.abs));

        // 3) Calculate bounds and midpoints for each range
        let minPosHeat = 0, midPosHeat = 0, maxPosHeat = 0, minNegHeat = 0, midNegHeat = 0, maxNegHeat = 0;
        if (posHeatValues.length) {
            minPosHeat = posHeatValues[0];
            midPosHeat = posHeatValues[Math.floor(posHeatValues.length / 2)];
            maxPosHeat = posHeatValues[posHeatValues.length - 1];
        }
        if (negHeatValues.length) {
            minNegHeat = negHeatValues[0];
            midNegHeat = negHeatValues[Math.floor(negHeatValues.length / 2)];
            maxNegHeat = negHeatValues[negHeatValues.length - 1];
        }

        // 4) Transform heatValue into a normalized colorValue, according to the colorMode.
        data.forEach(it => {
            const {heatValue} = it;

            if (!this.valueIsValid(heatValue)) {
                it.colorValue = 0.5; // Treat invalid values as zero
                return;
            }

            if (heatValue > 0) {
                // Normalize positive values between 0.6-1
                if (minPosHeat === maxPosHeat) {
                    it.colorValue = 0.8;
                } else if (colorMode === 'balanced' && posHeatValues.length > 2) {
                    if (it.colorValue >= midPosHeat) {
                        it.colorValue = this.normalizeToRange(heatValue, midPosHeat, maxPosHeat, 0.8, 1);
                    } else {
                        it.colorValue = this.normalizeToRange(heatValue, minPosHeat, midPosHeat, 0.6, 0.8);
                    }
                } else if (colorMode === 'linear' || posHeatValues.length === 2) {
                    it.colorValue = this.normalizeToRange(heatValue, minPosHeat, maxPosHeat, 0.6, 1);
                }
            } else if (heatValue < 0) {
                // Normalize negative values between 0-0.4
                const absHeatValue = Math.abs(heatValue);

                if (minNegHeat === maxNegHeat) {
                    it.colorValue = 0.2;
                } else if (colorMode === 'balanced' && negHeatValues.length > 2) {
                    if (absHeatValue >= midNegHeat) {
                        it.colorValue = this.normalizeToRange(absHeatValue, maxNegHeat, midNegHeat, 0, 0.2);
                    } else {
                        it.colorValue = this.normalizeToRange(absHeatValue, midNegHeat, minNegHeat, 0.2, 0.4);
                    }
                } else if (colorMode === 'linear' || negHeatValues.length === 2) {
                    it.colorValue = this.normalizeToRange(absHeatValue, maxNegHeat, minNegHeat, 0, 0.4);
                }
            } else {
                it.colorValue = 0.5; // Exactly zero
            }
        });

        return data;
    }

    /**
     * Takes a value, calculates its normalized (0-1) value within a specified range.
     * If a destination range is provided, returns that value transposed to within that range.
     */
    normalizeToRange(value, fromMin, fromMax, toMin, toMax) {
        const fromRange = (fromMax - fromMin),
            toRange = (toMax - toMin);

        if (isFinite(toRange)) {
            // Return value transposed to destination range
            return (((value - fromMin) * toRange) / fromRange) + toMin;
        } else {
            // Return value between 0-1
            return (value - fromMin) / fromRange;
        }
    }

    valueIsValid(value) {
        return isFinite(value);
    }

    //----------------------
    // Expand / Collapse
    //----------------------
    nodeIsExpanded(treePath) {
        if (isEmpty(this.expandState)) return false;
        return get(this.expandState, treePath, false);
    }

    toggleNodeExpanded(treePath) {
        const {gridModel} = this,
            expandState = cloneDeep(gridModel.expandState);

        if (get(expandState, treePath)) {
            unset(expandState, treePath);
        } else {
            set(expandState, treePath, true);
        }

        gridModel.setExpandState(expandState);
    }

    //----------------------
    // Click handling
    //----------------------
    defaultOnClick = (record, e) => {
        const {gridModel} = this;
        if (!gridModel) return;

        // Select nodes in grid
        const {selModel} = gridModel;
        if (selModel.mode === 'disabled') return;

        const multiSelect = selModel.mode === 'multiple' && e.shiftKey;
        selModel.select(record, !multiSelect);
        gridModel.ensureSelectionVisibleAsync();
    };

    defaultOnDoubleClick = (record) => {
        if (!this.gridModel?.treeMode || isEmpty(record.children)) return;
        this.toggleNodeExpanded(record.treePath);
    };

}

/**
 * @typedef {Object} TreeMapRecord
 * @property {(string|number)} id - Record id
 * @property {Record} record - Store record from which TreeMapRecord was created.
 * @property {string} name - Used by Highcharts to determine the node label.
 * @property {number} value - Used by Highcharts to determine the node size.
 * @property {number} heatValue - transient property used to determine the Highcharts colorValue.
 * @property {number} colorValue - Used by Highcharts to determine the color in a heat map.
 */

/**
 * @callback TreeMapModel~tooltipFn - normalized renderer function to produce a tree map tooltip.
 * @param {*} value - raw node data value.
 * @param {Record} record - row-level data Record.
 * @return {string} - the formatted value for display.
 */
