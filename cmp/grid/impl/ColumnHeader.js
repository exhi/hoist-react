/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {grid, GridModel} from '@xh/hoist/cmp/grid';
import {Column} from '@xh/hoist/cmp/grid/columns/Column';
import {div, filler, span} from '@xh/hoist/cmp/layout';
import {storeFilterField} from '@xh/hoist/cmp/store';
import {hoistCmp, HoistModel, managed, useLocalModel, XH} from '@xh/hoist/core';
import {CompoundFilter, FieldFilter, Store} from '@xh/hoist/data';
import {button} from '@xh/hoist/desktop/cmp/button';
import {checkbox} from '@xh/hoist/desktop/cmp/input';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {Icon} from '@xh/hoist/icon';
import {popover} from '@xh/hoist/kit/blueprint';
import {action, bindable, computed, makeObservable, observable} from '@xh/hoist/mobx';
import {olderThan} from '@xh/hoist/utils/datetime';
import {debounced} from '@xh/hoist/utils/js';
import {createObservableRef} from '@xh/hoist/utils/react';
import classNames from 'classnames';
import {
    clone,
    difference,
    filter,
    findIndex,
    forOwn,
    isEmpty,
    isEqual,
    isFinite,
    isFunction,
    isString,
    isUndefined,
    keys,
    omit,
    pickBy,
    uniqBy,
    without
} from 'lodash';
import {GridSorter} from './GridSorter';

/**
 * A custom ag-Grid header component.
 *
 * Relays sorting events directly to the controlling GridModel. Supports absolute value sorting
 * by checking `Column.absSort` to determine next sortBy and by rendering custom sort icons.
 *
 * @private
 */
export const columnHeader = hoistCmp.factory({
    displayName: 'ColumnHeader',
    className: 'xh-grid-header',
    model: false,

    render(props) {
        const impl = useLocalModel(() => new LocalModel(props));

        const sortIcon = () => {
            const {abs, sort} = impl.activeGridSorter ?? {};
            if (!sort) return null;

            let icon;
            if (sort === 'asc') {
                icon = abs ? Icon.arrowToTop({size: 'sm'}) : Icon.arrowUp({size: 'sm'});
            } else if (sort === 'desc') {
                icon = abs ? Icon.arrowToBottom({size: 'sm'}) : Icon.arrowDown({size: 'sm'});
            }
            return div({className: 'xh-grid-header-sort-icon', item: icon});
        };

        const menuIcon = () => {
            return props.enableMenu ? setFilterPopover({impl}) : null;
        };

        const extraClasses = [
            impl.isFiltered ? 'xh-grid-header-filtered' : null,
            impl.activeGridSorter ? 'xh-grid-header-sorted' : null,
            impl.hasNonPrimarySort ? 'xh-grid-header-multisort' : null
        ];

        const {xhColumn, gridModel} = impl,
            {isDesktop} = XH;

        // `props.displayName` is the output of the Column `headerValueGetter` and should always be a string
        // If `xhColumn` is present, it can consulted for a richer `headerName`
        let headerElem = props.displayName;
        if (xhColumn) {
            headerElem = isFunction(xhColumn.headerName) ?
                xhColumn.headerName({column: xhColumn, gridModel}) :
                xhColumn.headerName;
        }

        // If no app tooltip dynamically toggle a tooltip to display elided header
        let onMouseEnter = null;
        if (isDesktop && isUndefined(xhColumn?.headerTooltip)) {
            onMouseEnter = ({target: el}) => {
                if (el.offsetWidth < el.scrollWidth) {
                    const title = isString(headerElem) ? headerElem : props.displayName;
                    el.setAttribute('title', title);
                } else {
                    el.removeAttribute('title');
                }
            };
        }

        let headerCmp = div({
            className: classNames(props.className, extraClasses),
            onClick:        isDesktop  ? impl.onClick : null,
            onDoubleClick:  isDesktop  ? impl.onDoubleClick : null,
            onMouseDown:    isDesktop  ? impl.onMouseDown : null,
            onTouchStart:   !isDesktop ? impl.onTouchStart : null,
            onTouchEnd:     !isDesktop ? impl.onTouchEnd : null,

            items: [
                span({onMouseEnter, item: headerElem}),
                sortIcon(),
                menuIcon()
            ]
        });

        return headerCmp;
    }
});


export const setFilterPopover = hoistCmp.factory({
    render({impl}) {
        const {isOpen, isFiltered, setFilterGridModel, colId, xhColumn} = impl;
        return popover({
            className: 'xh-grid-header-menu-icon',
            position: 'bottom',
            boundary: 'viewport',
            hasBackdrop: true,
            isOpen,
            onInteraction: (open) => {
                if (!open) impl.closePopover();
            },
            target: div({
                item: isFiltered ? Icon.filter() : Icon.bars(),
                onClick: (e) => {
                    e.stopPropagation();
                    impl.openPopover();
                }
            }),
            content: panel({
                onClick: (e) => e.stopPropagation(),
                compactHeader: true,
                title: `Filter on ${xhColumn.displayName}`,
                item: grid({
                    model: setFilterGridModel,
                    height: 250,
                    width: 240
                }),
                tbar: toolbar({
                    compact: true,
                    item: storeFilterField({
                        icon: null,
                        flex: 1,
                        store: setFilterGridModel.store,
                        includeFields: [colId]
                    })
                }),
                bbar: toolbar({
                    compact: true,
                    items: [
                        button({
                            icon: Icon.undo(),
                            text: 'Reset',
                            intent: 'danger',
                            onClick: () => impl.resetFilter()
                        }),
                        filler(),
                        button({
                            text: 'Cancel',
                            onClick: () => impl.cancelAndUndoPendingValue()
                        }),
                        button({
                            icon: Icon.check(),
                            text: 'Apply',
                            intent: 'success',
                            onClick: () => impl.commitPendingValue()
                        })
                    ]
                })
            })
        });
    }
});

class LocalModel extends HoistModel {
    gridModel;
    xhColumn;
    agColumn;
    colId;
    menuButtonRef = createObservableRef();
    @observable isFiltered = false;
    enableSorting;
    availableSorts;

    @managed @observable.ref
    setFilterGridModel;

    _initialValue = {};
    @observable.ref committedValue = {};
    @observable.ref pendingValue = {};

    @bindable isOpen;

    _doubleClick = false;
    _lastTouch = null;
    _lastTouchStart = null;
    _lastMouseDown = null;

    constructor({gridModel, xhColumn, column: agColumn}) {
        super();
        makeObservable(this);

        this.gridModel = gridModel;
        this.xhColumn = xhColumn;
        this.agColumn = agColumn;
        this.colId = agColumn.colId;
        this.enableSorting = xhColumn.sortable;
        this.availableSorts = this.parseAvailableSorts();
        this.setFilterGridModel = this.createSetFilterGridModel();
        this.virtualStore = new Store({...this.gridModel.store});

        this.addReaction({
            track: () => [this.gridModel.store.filter, this.gridModel.store.allRecords],
            run: ([filter, allRecs]) => {
                if (this.virtualStore.empty) {
                    this.initializeVirtualStore();
                    return;
                }
                this.virtualStore.updateData(allRecs.map(rec => rec.raw));
                this.processAndSetFilter(filter);
            }
        });
    }

    initializeVirtualStore() {
        const allRecords = this.gridModel.store.allRecords.map(rec => (rec.raw)),
            {colId} = this;
        this.virtualStore.loadData(allRecords);

        const ret = {};
        uniqBy(allRecords, (rec) => rec[colId]).forEach(it => {
            ret[it[colId]] = true;
        });

        this._initialValue = ret;
        this.committedValue = ret;

        this.processAndSetFilter();
    }

    @action
    processAndSetFilter(filter) {
        if (!this.setFilterGridModel) return;

        const {colId} = this;
        // TODO - make more correct
        if (filter?.isCompoundFilter) {
            const fieldFilters = filter.getFieldFiltersForField(colId),
                equalsFilter = fieldFilters.find(it => it.op === '='),
                newFilters = without(filter.filters, equalsFilter);

            this.virtualStore.setFilter({op: 'AND', filters: newFilters});
        } else if (filter?.isFieldFilter && filter.field !== colId) {
            this.virtualStore.setFilter(filter);
        }

        const allVals = uniqBy(this.virtualStore.allRecords, (rec) => rec.raw[colId]),
            visibleVals = uniqBy(this.virtualStore.records, (rec) => rec.raw[colId]),
            hiddenVals = difference(allVals, visibleVals).map(rec => rec.raw[colId]),
            currentVals = visibleVals.map(it => ({
                [colId]: it.raw[colId],
                isChecked: this.committedValue[it.raw[colId]] ?? false
            }));

        // Only load set filter grid with VISIBLE values
        this.setFilterGridModel.loadData(currentVals);
        const ret = omit(this.committedValue, hiddenVals);
        currentVals.forEach(rec => {
            if (!ret.hasOwnProperty(rec[colId])) {
                ret[rec[colId]] = this.committedValue[rec[colId]] ?? false;
            }
        });
        this.setPendingValue(ret);
    }

    createSetFilterGridModel() {
        if (!this.xhColumn.enableFilter) return null;

        const {renderer, rendererIsComplex} = this.xhColumn;
        return new GridModel({
            sortBy: this.colId,
            store: {
                idSpec: (raw) => raw[this.colId].toString(),
                fields: [
                    this.colId,
                    {name: 'isChecked', type: 'bool'}
                ]
            },
            emptyText: 'No records found...',
            selModel: {mode: 'multiple'},
            sizingMode: 'compact',
            columns: [
                {
                    field: 'isChecked',
                    sortable: false,
                    headerName: ({gridModel}) => {
                        const {store} = gridModel;
                        return checkbox({
                            disabled: store.empty,
                            displayUnsetState: true,
                            value: this.allVisibleRecsChecked,
                            onChange: () => this.toggleBulk(!this.allVisibleRecsChecked)
                        });
                    },
                    width: 30,
                    rendererIsComplex: true,
                    elementRenderer: (v, {record}) => {
                        return checkbox({
                            displayUnsetState: true,
                            value: record.data.isChecked,
                            onChange: () => this.toggleNode(!v, record.id)
                        });
                    }
                },
                {
                    field: this.colId,
                    flex: 1,
                    renderer,
                    rendererIsComplex
                }
            ]
        });
    }

    @computed
    get allVisibleRecsChecked() {
        if (!this.setFilterGridModel) return false;

        const {records} = this.setFilterGridModel.store;
        if (isEmpty(records)) {
            return false;
        }

        const isChecked = records[0].data.isChecked;
        for (let record of records) {
            if (record.data.isChecked !== isChecked) return null;
        }
        return isChecked;
    }


    @action
    toggleNode(isChecked, value) {
        const {pendingValue} = this,
            currValue = {
                ...pendingValue,
                [value]: isChecked
            };
        this.setPendingValue(currValue);
    }

    @action
    toggleBulk(isChecked) {
        const currValue = forOwn(clone(this.pendingValue), (v, k, pendingVal) => {
            pendingVal[k] = isChecked;
        });
        this.setPendingValue(currValue);
    }

    @action
    setPendingValue(currValue) {
        const {pendingValue, setFilterGridModel} = this;
        if (isEqual(currValue, pendingValue)) return;

        this.pendingValue = currValue;

        const ret = [];
        for (const key in currValue) {
            ret.push({
                id: key.toString(),
                isChecked: currValue[key]
            });
        }

        setFilterGridModel.store.modifyRecords(ret);
    }

    commitPendingValue() {
        const {pendingValue, colId} = this,
            ret = clone(this.committedValue);

        for (const val in pendingValue) {
            ret[val] = pendingValue[val];
        }

        this.committedValue = ret;

        const fieldFilter = new FieldFilter({
            field: this.colId,
            value: keys(pickBy(ret, v => v)),
            op: '='
        });

        const {store} = this.gridModel,
            {filter} = store;

        if (filter?.isCompoundFilter) {
            const fieldFilters = filter.getFieldFiltersForField(this.colId),
                equalsFilter = fieldFilters.find(it => it.op === '='),
                newFilters = without(filter.filters, equalsFilter);

            store.setFilter(new CompoundFilter({filters: [...newFilters, fieldFilter], op: 'AND'}));
        } else if (filter?.isFieldFilter && filter.field !== colId) {
            store.setFilter(new CompoundFilter({filters: [filter, fieldFilter], op: 'AND'}));
        } else {
            store.setFilter(fieldFilter);
        }

        this.isFiltered = !isEqual(this.committedValue, this._initialValue);
    }

    cancelAndUndoPendingValue() {
        this.setPendingValue(this.committedValue);
        this.commitPendingValue();

        this.closePopover();
    }

    @action
    resetFilter() {
        this.setFilterGridModel.store.setFilter(null);
        this.committedValue = {};
        this.setPendingValue(this._initialValue);
        this.commitPendingValue();
    }

    openPopover() {
        this.setIsOpen(true);
    }

    closePopover() {
        this.setIsOpen(false);
    }


    destroy() {
        // this.agColumn.removeEventListener('filterChanged', this.onFilterChanged);
        super.destroy();
    }

    // Get any active sortBy for this column, or null
    @computed
    get activeGridSorter() {
        if (!this.gridModel || !this.enableSorting) return null; // ag-grid auto group column won't have a gridModel
        return this.gridModel.sortBy.find(it => it.colId === this.colId);
    }

    @computed
    get hasNonPrimarySort() {
        const {activeGridSorter} = this;
        return activeGridSorter ? this.gridModel.sortBy.indexOf(activeGridSorter) > 0 : false;
    }

    // Desktop click handling
    onMouseDown = (e) => {
        this._lastMouseDown = Date.now();
    };

    onClick = (e) => {
        if (olderThan(this._lastMouseDown, 500)) return;  // avoid spurious reaction to drag end.
        this._doubleClick = false;
        this.updateSort(e.shiftKey);
    };

    onDoubleClick = () => {
        this._doubleClick = true;
        this.autosize();
    };

    // Mobile touch handling
    onTouchStart = (e) => {
        this._lastTouchStart = Date.now();
    };

    onTouchEnd = () => {
        if (olderThan(this._lastTouchStart, 500)) return;  // avoid spurious reaction to drag end.

        if (!olderThan(this._lastTouch, 300)) {
            this._doubleClick = true;
            this.autosize();
        } else {
            this._doubleClick = false;
            this.updateSort();
        }

        this._lastTouch = Date.now();
    };

    // onFilterChanged = () => this.setIsFiltered(this.gridModel.store.isFiltered);

    //-------------------
    // Implementation
    //-------------------
    @debounced(300)
    updateSort(shiftKey) {
        if (!this.enableSorting || !this.gridModel || this._doubleClick) return;

        const {gridModel, activeGridSorter, colId} = this;

        let sortBy;
        if (shiftKey) {
            // For shift, modify sorters
            sortBy = filter(gridModel.sortBy, it => it.colId !== colId);
            // Add new sort if this was a complex sort or no sort on this column.
            if (!activeGridSorter || !isEmpty(sortBy)) {
                const nextSortBy = this.getNextSortBy();
                if (nextSortBy) sortBy.push(nextSortBy);
            }
        } else {
            // Otherwise straightforward replace
            const nextSortBy = this.getNextSortBy();
            sortBy = nextSortBy ? [nextSortBy] : [];
        }

        gridModel.setSortBy(sortBy);
    }

    getNextSortBy() {
        const {availableSorts, activeGridSorter} = this;
        if (!availableSorts.length) return null;

        let idx = 0;
        if (activeGridSorter) {
            const {colId, sort, abs} = activeGridSorter,
                currIdx = findIndex(availableSorts, {colId, sort, abs});

            if (isFinite(currIdx)) idx = (currIdx + 1) % availableSorts.length;
        }


        return availableSorts[idx];
    }

    autosize() {
        const {gridModel} = this;
        if (gridModel?.autosizeEnabled) {
            gridModel.autosizeAsync({columns: this.colId, showMask: false});
        }
    }

    parseAvailableSorts() {
        const {
            absSort = false,
            sortingOrder = Column.DEFAULT_SORTING_ORDER,
            colId = this.colId
        } = this.xhColumn ?? {}; // Note xhColumn may be null for ag-Grid dynamic columns

        const ret = sortingOrder.map(spec => {
            if (isString(spec) || spec === null) spec = {sort: spec};
            return new GridSorter({...spec, colId});
        });
        return absSort ? ret : ret.filter(it => !it.abs);
    }
}
