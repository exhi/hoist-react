/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {action, bindable, computed, observable, makeObservable} from '@xh/hoist/mobx';
import {combineValueFilters} from '@xh/hoist/data';
import {castArray, compact, isEmpty} from 'lodash';

import {CustomFilterRowModel} from './CustomFilterRowModel';

export class CustomFilterTabModel extends HoistModel {
    /** @member {FilterPopoverModel} */
    parentModel;

    @bindable op = 'AND';
    @observable.ref rowModels = [];

    /**
     * @member {Object} - Filter config output by this model
     */
    @computed.struct
    get filter() {
        const filters = combineValueFilters(compact(this.rowModels.map(it => it.value)));
        if (isEmpty(filters)) return null;
        const {op} = this;
        return filters.length > 1 ? {filters, op} : filters[0];
    }

    @computed
    get hasImplicitOr() {
        let equalsCount = 0, likeCount = 0;
        this.rowModels.forEach(it => {
            if (it.op === '=') equalsCount++;
            if (it.op === 'like') likeCount++;
        });
        return equalsCount > 1 || likeCount > 1;
    }

    get columnFilters() {
        return this.parentModel.columnFilters;
    }

    get colId() {
        return this.parentModel.colId;
    }

    get type() {
        return this.parentModel.type;
    }

    constructor(parentModel) {
        super();
        makeObservable(this);
        this.parentModel = parentModel;
    }

    loadStoreFilter() {
        this.doLoadStoreFilter();
    }

    @action
    reset() {
        XH.safeDestroy(this.rowModels);
        this.rowModels = [new CustomFilterRowModel({parentModel: this})];
    }

    @action
    addEmptyRow() {
        this.rowModels = [...this.rowModels, new CustomFilterRowModel({parentModel: this})];
    }

    @action
    removeRow(model) {
        this.rowModels = this.rowModels.filter(it => it.xhId !== model.xhId);
        XH.safeDestroy(model);
    }

    //-------------------
    // Implementation
    //-------------------
    @action
    doLoadStoreFilter() {
        const {columnFilters} = this,
            rowModels = [];

        // Create rows based on store filter.
        columnFilters.forEach(filter => {
            const {op, value} = filter;
            if (op === '=' || op === 'like') {
                castArray(value).forEach(it => {
                    rowModels.push(new CustomFilterRowModel({parentModel: this, op, value: it}));
                });
            } else {
                rowModels.push(new CustomFilterRowModel({parentModel: this, op, value}));
            }
        });

        // Add an empty pending row
        if (isEmpty(rowModels)) {
            rowModels.push(new CustomFilterRowModel({parentModel: this}));
        }

        this.rowModels = rowModels;
    }
}