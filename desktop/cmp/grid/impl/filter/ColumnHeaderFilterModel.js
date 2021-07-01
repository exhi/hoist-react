/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {observable, action, computed, makeObservable} from '@xh/hoist/mobx';
import {flattenFilter} from '@xh/hoist/data';
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {wait} from '@xh/hoist/promise';
import {isEmpty} from 'lodash';

import {customFilterTab} from './custom/CustomFilterTab';
import {CustomFilterTabModel} from './custom/CustomFilterTabModel';
import {enumFilterTab} from './enum/EnumFilterTab';
import {EnumFilterTabModel} from './enum/EnumFilterTabModel';

export class ColumnHeaderFilterModel extends HoistModel {
    gridModel;
    xhColumn;
    colId;

    @observable.ref filter = null;
    @observable isOpen = false;
    @observable showMask = false;

    @managed tabContainerModel;
    @managed enumFilterTabModel;
    @managed customFilterTabModel;

    get currentFilter() {
        return this.gridModel.filterModel.filter;
    }

    get columnFilters() {
        return flattenFilter(this.currentFilter).filter(it => it.field === this.colId);
    }

    get type() {
        return this.valueSource?.getField(this.colId).type;
    }

    get valueSource() {
        return this.gridModel.filterModel.valueSource;
    }

    get hasFilter() {
        return !isEmpty(this.columnFilters);
    }

    get hasPendingFilter() {
        if (this.tabContainerModel.activeTabId === 'enumFilter') {
            return !!this.enumFilterTabModel.filter;
        } else {
            return !!this.customFilterTabModel.filter;
        }
    }

    @computed
    get isCustomFilter() {
        const {columnFilters} = this;
        if (isEmpty(columnFilters)) return false;
        return columnFilters.length > 1 || columnFilters[0].op !== '=';
    }

    get enableEnumFilter() {
        return this.xhColumn.enableEnumFilter;
    }

    constructor({gridModel, xhColumn, agColumn}) {
        super();
        makeObservable(this);

        const {colId} = agColumn;
        this.gridModel = gridModel;
        this.xhColumn = xhColumn;
        this.colId = colId;

        this.enumFilterTabModel = new EnumFilterTabModel(this);
        this.customFilterTabModel = new CustomFilterTabModel(this);
        this.tabContainerModel = new TabContainerModel({
            switcher: false,
            tabs: [
                {
                    id: 'enumFilter',
                    title: 'Values',
                    content: enumFilterTab
                },
                {
                    id: 'customFilter',
                    title: 'Custom',
                    content: customFilterTab
                }
            ]
        });
    }

    @action
    commit() {
        let filter;
        if (this.tabContainerModel.activeTabId === 'enumFilter') {
            filter = this.enumFilterTabModel.filter;
        } else {
            filter = this.customFilterTabModel.filter;
        }

        // Applying filter can take time for large datasets.
        // Show a mask to provide feedback to user.
        this.showMask = true;
        wait(1).then(() => {
            this.setColumnFilter(filter);
            this.closeMenu();
        });
    }

    @action
    clear(close = true) {
        this.setColumnFilter(null);
        if (close) {
            this.closeMenu();
        } else {
            this.syncWithFilter();
        }
    }

    @action
    openMenu() {
        this.isOpen = true;
        this.showMask = false;
        this.syncWithFilter();
    }

    @action
    closeMenu() {
        this.isOpen = false;
    }

    //-------------------
    // Implementation
    //-------------------
    @action
    syncWithFilter() {
        const {columnFilters, isCustomFilter, enableEnumFilter} = this;

        this.enumFilterTabModel.reset();
        this.customFilterTabModel.reset();

        if (!isEmpty(columnFilters)) {
            if (isCustomFilter) {
                // There are column filters that can only be represented on the custom filter tab
                this.customFilterTabModel.syncWithFilter();
            } else {
                // There is a column filter that can be represented on the enum filter tab
                this.enumFilterTabModel.syncWithFilter();
            }
        }

        const tab = isCustomFilter || !enableEnumFilter ? 'customFilter' : 'enumFilter';
        this.tabContainerModel.activateTab(tab);
    }

    setColumnFilter(filter) {
        this.gridModel.filterModel.setColumnFilter(this.colId, filter);
    }
}
