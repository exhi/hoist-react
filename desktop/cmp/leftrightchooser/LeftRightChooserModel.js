/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel, XH} from '@xh/hoist/core';
import {GridModel} from '@xh/hoist/desktop/cmp/grid';
import {LocalStore} from '@xh/hoist/data';
import {computed} from '@xh/hoist/mobx';
import {div} from '@xh/hoist/cmp/layout';
import {Icon} from '@xh/hoist/icon';

/**
 * A Model for managing the state of a LeftRightChooser.
 */
@HoistModel()
export class LeftRightChooserModel {
    /** Grid Model for the left-hand side */
    leftModel = null;

    /** Grid Model for the right-hand side */
    rightModel = null;

    /** Property to enable/disable the description panel */
    hasDescription = null;

    _lastSelectedSide = null;

    _leftGroupingEnabled = null;
    _rightGroupingEnabled = null;
    leftGroupingExpanded = null;
    rightGroupingExpanded = null;

    /**
     * Filter for data rows to determine if they should be shown.
     * Useful for helping users find values of interest in a large pool of rows.
     *
     * Note that this will *not* affect the actual 'value' property, which will continue
     * to include unfiltered records.
     *
     * @see LeftRightChooserFilter - a component to easily control this field.
     *
     * @param {function} fn
     */
    setDisplayFilter(fn) {
        this.leftModel.store.setFilter(fn);
        this.rightModel.store.setFilter(fn);
    }

    /** Currently 'selected' values on the right hand side. */
    @computed
    get rightValues() {
        return this.rightModel.store.allRecords.map(it => it.value);
    }

    /** Currently 'selected' values on the left hand side. */
    @computed
    get leftValues() {
        return this.leftModel.store.allRecords.map(it => it.value);
    }

    /**
     * @param {Object[]} data - source for both lists, with each item containing the properties below.
     * @param {string} data[].text - primary label for the item.
     * @param {string} data[].value - value that the item represents.
     * @param {string} data[].description - user-friendly, longer description of the item.
     * @param {string} data[].group - grid group in which to show the item.
     * @param {string} data[].side - initial side of the item.
     * @param {boolean} data[].locked - true to prevent the user from moving the item between sides.
     * @param {boolean} data[].exclude - true to exclude the item from the chooser entirely.
     *
     * @param {string} ungroupedName - placeholder group value when an item has no group.
     * @param {string} leftTitle - title of the left-side list.
     * @param {boolean} leftGroupingEnabled - true to enable grouping on the the left-side list.
     * @param {Object[]} leftSortBy - one or more sorters to apply to the left-side store.
     * @param {string} rightTitle - title of the right-side list.
     * @param {boolean} rightGroupingEnabled - true to enable grouping on the the right-side list.
     * @param {Object[]} rightSortBy - one or more sorters to apply to the right-side store.
     * @param {boolean} collapseGroupsOnRender - true to override default one level group expansion
     */
    constructor({
        data = [],
        ungroupedName = 'Ungrouped',
        leftTitle = 'Available',
        leftGroupingEnabled = true,
        leftGroupingExpanded = true,
        leftSortBy = [],
        rightTitle = 'Selected',
        rightGroupingEnabled = true,
        rightGroupingExpanded = true,
        rightSortBy = []
    }) {
        this._ungroupedName = ungroupedName;
        this._leftGroupingEnabled = leftGroupingEnabled;
        this._rightGroupingEnabled = rightGroupingEnabled;
        this.leftGroupingExpanded = leftGroupingExpanded;
        this.rightGroupingExpanded = rightGroupingExpanded;

        const fields = ['text', 'value', 'description', 'group', 'side', 'locked', 'exclude'];

        const leftTextCol = {field: 'text', flex: true, elementRenderer: (params) => this.textColRenderer(params, leftGroupingEnabled)},
            rightTextCol = {field: 'text', flex: true, elementRenderer: (params) => this.textColRenderer(params, rightGroupingEnabled)},
            groupCol = {field: 'group', headerName: 'Group', hide: true};

        this.leftModel = new GridModel({
            store: new LocalStore({fields}),
            selModel: 'multiple',
            sortBy: leftSortBy,
            columns: [{...leftTextCol, headerName: leftTitle}, groupCol]
        });

        this.rightModel = new GridModel({
            store: new LocalStore({fields}),
            selModel: 'multiple',
            sortBy: rightSortBy,
            columns: [{...rightTextCol, headerName: rightTitle}, groupCol]
        });

        this.setData(data);

        this.addReaction(this.syncSelectionReaction());
    }

    setData(data) {
        const hasGrouping = data.some(it => it.group),
            lhGroupBy = (this._leftGroupingEnabled && hasGrouping) ? 'group' : null,
            rhGroupBy = (this._rightGroupingEnabled && hasGrouping) ? 'group' : null;

        this.hasDescription = data.some(it => it.description);
        this.leftModel.setGroupBy(lhGroupBy);
        this.rightModel.setGroupBy(rhGroupBy);

        this._data = this.preprocessData(data);
        this.refreshStores();
    }

    //------------------------
    // Implementation
    //------------------------
    textColRenderer(props, groupingEnabled) {
        const {value, data} = props,
            lockedText = Icon.lock({prefix: 'fal'}),
            groupClass = groupingEnabled ? 'xh-lr-chooser__group-row' : '';

        return div({
            className: `xh-lr-chooser__item-row ${groupClass}`,
            items: [
                value,
                data.locked ? lockedText : null
            ]
        });
    }

    preprocessData(data) {
        return data
            .filter(rec => !rec.exclude)
            .map((raw, idx) => {
                raw.group = raw.group || this._ungroupedName;
                raw.side = raw.side || 'left';
                raw.id = raw.id != null ? raw.id : idx;
                return raw;
            });
    }

    moveRows(rows) {
        rows.forEach(rec => {
            if (rec.locked) return;

            const rawRec = this._data.find(raw => raw === rec.raw);
            rawRec.side = (rec.side === 'left' ? 'right' : 'left');
        });

        this.refreshStores();
    }

    syncSelectionReaction() {
        const leftSel = this.leftModel.selModel,
            rightSel = this.rightModel.selModel;
        
        return {
            track: () => [leftSel.singleRecord, rightSel.singleRecord],
            run: () => {
                const lastSelectedSide = this._lastSelectedSide;
                if (leftSel.singleRecord && lastSelectedSide !== 'left') {
                    this._lastSelectedSide = 'left';
                    rightSel.clear();
                } else if (rightSel.singleRecord && lastSelectedSide !== 'right') {
                    this._lastSelectedSide = 'right';
                    leftSel.clear();
                }
            }
        };
    }

    refreshStores() {
        const data = this._data,
            {leftModel, rightModel} = this;

        leftModel.store.loadData(data.filter(it => it.side === 'left'));
        rightModel.store.loadData(data.filter(it => it.side === 'right'));
    }

    destroy() {
        XH.safeDestroy(this.leftModel, this.rightModel);
    }
}