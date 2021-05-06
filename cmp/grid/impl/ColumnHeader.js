/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {grid, GridModel} from '@xh/hoist/cmp/grid';
import {Column} from '@xh/hoist/cmp/grid/columns/Column';
import {div, filler, span, vbox, vspacer} from '@xh/hoist/cmp/layout';
import {storeFilterField} from '@xh/hoist/cmp/store';
import {tabContainer, TabContainerModel} from '@xh/hoist/cmp/tab';
import {hoistCmp, HoistModel, managed, useLocalModel, XH} from '@xh/hoist/core';
import {CompoundFilter, FieldFilter, Store} from '@xh/hoist/data';
import {button} from '@xh/hoist/desktop/cmp/button';
import {
    buttonGroupInput,
    checkbox,
    textInput,
    select,
    numberInput, dateInput
} from '@xh/hoist/desktop/cmp/input';
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
    isEmpty,
    isEqual,
    isFinite,
    isFunction,
    isNull,
    isString,
    isUndefined,
    keys,
    mapValues,
    omit,
    pickBy,
    uniq,
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
        const {isOpen, isFiltered, setFilterGridModel, colId, xhColumn, type, tabContainerModel} = impl,
            isSetFilter = tabContainerModel.activeTabId === 'setFilter';

        return popover({
            className: 'xh-grid-header-menu-icon',
            position: 'bottom',
            boundary: 'viewport',
            hasBackdrop: true,
            interactionKind: 'click',
            isOpen,
            onInteraction: (open) => {
                if (!open) impl.cancelAndUndoPendingFilter();
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
                title: `Filter ${xhColumn.displayName} by:`,
                headerItems: [
                    buttonGroupInput({
                        minHeight: 20,
                        maxHeight: 20,
                        marginRight: 2,
                        model: impl,
                        intent: 'primary',
                        bind: 'tabId',
                        items: [
                            button({
                                style: {
                                    fontSize: 10,
                                    minHeight: 20,
                                    maxHeight: 20
                                },
                                value: 'setFilter',
                                text: 'Set',
                                width: 40
                            }),
                            button({
                                disabled: type === 'bool',
                                style: {
                                    fontSize: 10,
                                    minHeight: 20,
                                    maxHeight: 20
                                },
                                value: 'inputFilter',
                                text: 'Input',
                                width: 40
                            })
                        ]
                    })
                ],
                item: tabContainer({
                    model: tabContainerModel
                }),
                tbar: toolbar({
                    omit: !isSetFilter,
                    compact: true,
                    item: storeFilterField({
                        model: impl,
                        bind: 'filterText',
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
                            onClick: () => {
                                isSetFilter ?
                                    impl.resetSetFilter() :
                                    impl.resetInputFilter();
                            }
                        }),
                        filler(),
                        button({
                            text: 'Cancel',
                            onClick: () => impl.cancelAndUndoPendingFilter()
                        }),
                        button({
                            icon: Icon.check(),
                            text: 'Apply',
                            intent: 'success',
                            onClick: () => {
                                isSetFilter ?
                                    impl.commitPendingFilter() :
                                    impl.commitInputFilter();
                            }
                        })
                    ]
                })
            })
        });
    }
});

const inputFilter = hoistCmp.factory({
    render({model}) {
        const {type} = model;
        let cmp;
        switch (type) {
            case 'number':
            case 'int':
                cmp = numberInput({
                    bind: 'inputVal',
                    enableShorthandUnits: true,
                    enableClear: true
                }); break;
            case 'localDate':
            case 'date':
                cmp = dateInput({
                    bind: 'inputVal',
                    valueType: type,
                    enableClear: true
                }); break;
            default:
                cmp = textInput({bind: 'inputVal', enableClear: true});
        }

        return vbox({
            alignItems: 'center',
            justifyContent: 'center',
            items: [
                select({
                    bind: 'op',
                    options:
                        ['number', 'int', 'localDate', 'date'].includes(type) ?
                            [
                                {label: 'Equals', value: '='},
                                {label: 'Not Equals', value: '!='},
                                {label: 'Greater Than', value: '>'},
                                {label: 'Greater Than Or Equal to', value: '>='},
                                {label: 'Less Than', value: '<'},
                                {label: 'Less Than or Equal to', value: '<='}
                            ] :
                            [
                                {label: 'Equals', value: '='},
                                {label: 'Not Equals', value: '!='},
                                {label: 'Contains', value: 'like'}
                            ]
                }),
                vspacer(),
                cmp
            ],
            height: 250,
            width: 240
        });
    }
});

class LocalModel extends HoistModel {
    gridModel;
    xhColumn;
    agColumn;
    colId;
    menuButtonRef = createObservableRef();
    enableSorting;
    availableSorts;

    // Set Filter Menu
    @managed @observable.ref
    setFilterGridModel;
    @managed
    virtualStore;
    @managed
    tabContainerModel = new TabContainerModel({
        tabs: [
            {
                id: 'setFilter',
                title: 'Set',
                content: () => grid({
                    model: this.setFilterGridModel,
                    height: 226,
                    width: 240
                })
            },
            {
                id: 'inputFilter',
                title: 'Input',
                content: () => inputFilter({model: this})
            }
        ],
        switcher: false
    });
    @bindable tabId = null;


    _initialFilter = {};
    @observable.ref committedFilter = {};
    @observable.ref pendingFilter = {};
    @bindable filterText = null;
    @observable isFiltered = false;
    @bindable isOpen = false;
    virtualStoreLastUpdated = null;
    currentStoreFilter = null;

    @bindable op = '!=';
    @bindable inputVal = null;
    @bindable committedInputFilter = null;

    _doubleClick = false;
    _lastTouch = null;
    _lastTouchStart = null;
    _lastMouseDown = null;

    get type() {
        return this.virtualStore.getField(this.colId).type;
    }

    get inputFilter() {
        if (!this.op || isNull(this.inputVal)) return null;
        return new FieldFilter({
            field: this.colId,
            op: this.op,
            value: this.inputVal.toString().trim()
        });
    }

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
        this.virtualStore = new Store({...this.gridModel.store, loadRootAsSummary: false});

        this.addReaction({
            track: () => [this.gridModel.store.filter, this.gridModel.store.lastUpdated, this.isOpen],
            run: ([filter, lastUpdated, isOpen]) => {
                if (!isOpen && !lastUpdated) return;
                this.loadVirtualStore();
                this.processAndSetFilter(filter);
            }
        });

        this.addReaction({
            track: () => this.tabId,
            run: (tabId) => this.tabContainerModel.activateTab(tabId)
        });
    }

    getLeaves(root) {
        if (!root.children) return [root];
        return root.children.flatMap(child => this.getLeaves(child));
    }

    loadVirtualStore() {
        const {virtualStore, virtualStoreLastUpdated, gridModel, colId, committedFilter} = this,
            allRecords = gridModel.treeMode ?
                this.getLeaves(gridModel.store.summaryRecord.raw) :
                gridModel.store.allRecords.map(rec => (rec.raw));

        if (virtualStoreLastUpdated === gridModel.store.lastUpdated) return;

        if (!virtualStoreLastUpdated || (virtualStoreLastUpdated !== gridModel.store.lastUpdated)) {
            virtualStore.loadData(allRecords);
            this.virtualStoreLastUpdated = gridModel.store.lastUpdated;
        }

        const ret = {};
        uniqBy(allRecords, (rec) => rec[colId]).forEach(it => {
            const key = it[colId];
            ret[key] = committedFilter[key] ?? true;
        });

        this.committedFilter = ret;
        this._initialFilter = mapValues(ret, () => true);
    }

    @action
    processAndSetFilter(filter) {
        const {setFilterGridModel, virtualStore, committedFilter, committedInputFilter} = this;
        if (!setFilterGridModel) return;

        const {colId} = this;

        if (!filter) {
            virtualStore.setFilter(null);
        } else if (filter.isCompoundFilter) {
            const fieldFilters = filter.getFieldFiltersForField(colId),
                equalsFilter = fieldFilters.find(it => it.op === '='),
                newFilters = without(filter.filters, equalsFilter);

            virtualStore.setFilter({op: 'AND', filters: newFilters});
        } else if (filter.isFieldFilter && filter.field !== colId) {
            virtualStore.setFilter(filter);
        } else if (filter.isFieldFilter && filter.field === colId && filter.op !== '=') {
            virtualStore.setFilter(filter);
        } else if (filter.isFieldFilter && filter.field === colId && filter.op === '=') {
            if (filter.equals(committedInputFilter)) {
                virtualStore.setFilter(filter);
            }
        }

        const allVals = uniqBy(virtualStore.allRecords, (rec) => rec.data[colId]),
            visibleVals = uniqBy(virtualStore.records, (rec) => rec.data[colId]),
            hiddenVals = difference(allVals, visibleVals).map(rec => rec.data[colId]),
            currentVals = visibleVals.map(it => ({
                [colId]: it.data[colId],
                isChecked: committedFilter[it.data[colId]] || (committedInputFilter?.value == it.data[colId] ?? false)
            }));

        // Only load set filter grid with VISIBLE values
        setFilterGridModel.loadData(currentVals);
        const ret = omit(committedFilter, hiddenVals);
        currentVals.forEach(rec => {
            if (!ret.hasOwnProperty(rec[colId])) {
                ret[rec[colId]] = committedFilter[rec[colId]] || (committedInputFilter?.value == rec[colId] ?? false);
            }
        });
        this.setPendingFilter(ret);
    }

    createSetFilterGridModel() {
        if (!this.xhColumn.enableFilter) return null;

        const {renderer, rendererIsComplex, headerName} = this.xhColumn;
        return new GridModel({
            store: {
                idSpec: (raw) => raw[this.colId].toString(),
                fields: [
                    this.colId,
                    {name: 'isChecked', type: 'bool'}
                ]
            },
            selModel: 'disabled',
            emptyText: 'No records found...',
            contextMenu: null,
            sizingMode: 'compact',
            stripeRows: false,
            sortBy: this.colId,
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
                    headerName,
                    renderer, // TODO - handle cases like bool check col where rendered values look null
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
        const {pendingFilter} = this,
            currValue = {
                ...pendingFilter,
                [value]: isChecked
            };
        this.setPendingFilter(currValue);
    }

    @action
    toggleBulk(isChecked) {
        const {records} = this.setFilterGridModel.store,
            ret = clone(this.pendingFilter);

        for (let rec of records) {
            ret[rec.id] = isChecked;
        }

        this.setPendingFilter(ret);
    }

    @action
    setPendingFilter(currValue) {
        const {pendingFilter, setFilterGridModel} = this;
        if (isEqual(currValue, pendingFilter)) return;

        this.pendingFilter = currValue;

        const ret = [];
        for (const key in currValue) {
            if (setFilterGridModel.store.getById(key)) {
                ret.push({
                    id: key,
                    isChecked: currValue[key]
                });
            }
        }

        setFilterGridModel.store.modifyRecords(ret);
    }

    @action
    commitInputFilter() {
        const {inputFilter, colId, gridModel, op, committedInputFilter} = this,
            {store} = gridModel,
            {filter} = store;

        let equalValueToRemove;

        if (committedInputFilter) {
            if (committedInputFilter.op === '=') {
                equalValueToRemove = committedInputFilter.value;
            }
        }
        if (filter?.isCompoundFilter) {
            const fieldFilters = filter.getFieldFiltersForField(this.colId),
                equalsFilter = fieldFilters.find(it => it.op === '=');

            if (equalsFilter && op === '=') {
                const newFilter = clone(equalsFilter);
                newFilter.value = [...without(equalsFilter.value, equalValueToRemove), this.inputVal];

                this.currentStoreFilter = new CompoundFilter({
                    filters: [...without(filter.filters, equalsFilter), newFilter],
                    op: 'AND'
                });
            } else {
                this.currentStoreFilter = new CompoundFilter({
                    filters: [...without(filter.filters, committedInputFilter), inputFilter],
                    op: 'AND'
                });
            }
        } else if (filter?.isFieldFilter && filter.field !== colId) {
            this.currentStoreFilter = new CompoundFilter({filters: [filter, inputFilter], op: 'AND'});
        } else if (filter?.isFieldFilter && filter.field === colId) {
            if (!inputFilter) {
                this.currentStoreFilter = null;
            } else if (filter.op === op) {
                let newFilter;
                if (FieldFilter.ARRAY_OPERATORS.includes(op)) {
                    newFilter = clone(filter);
                    newFilter.value = [...without(filter.value, equalValueToRemove), this.inputVal];
                } else {
                    newFilter = inputFilter;
                }
                this.currentStoreFilter = newFilter;
            } else {
                this.currentStoreFilter = new CompoundFilter({filters: without([filter, inputFilter], committedInputFilter), op: 'AND'});
            }
        } else {
            this.currentStoreFilter = inputFilter;
        }

        this.committedInputFilter = inputFilter;

        store.setFilter(this.currentStoreFilter);
        this.isFiltered = true;
    }

    @action
    commitPendingFilter() {
        const {pendingFilter, colId, type, gridModel, committedInputFilter} = this,
            ret = clone(this.committedFilter);

        let equalValueToAdd;

        if (committedInputFilter) {
            if (committedInputFilter.op === '=') {
                equalValueToAdd = committedInputFilter.value;
            }
        }

        for (const val in pendingFilter) {
            ret[val] = pendingFilter[val];
        }

        let value = keys(pickBy(ret, v => v));

        if (equalValueToAdd) {
            value.push(equalValueToAdd);
            value = uniq(value);
        }

        if (type === 'bool') {
            value = value.map(it => {
                if (it === 'true') return true;
                if (it === 'false') return false;
                return null;
            });
        }

        this.committedFilter = ret;

        const {store} = gridModel,
            {filter} = store,
            fieldFilter = new FieldFilter({
                field: this.colId,
                value,
                op: '='
            });

        if (filter?.isCompoundFilter) {
            const fieldFilters = filter.getFieldFiltersForField(this.colId),
                equalsFilter = fieldFilters.find(it => it.op === '='),
                newFilters = without(filter.filters, equalsFilter);

            if (committedInputFilter) newFilters.push(committedInputFilter);

            this.currentStoreFilter = new CompoundFilter({filters: [...newFilters, fieldFilter], op: 'AND'});
        } else if (filter?.isFieldFilter && filter.field !== colId) {
            const filters = [filter, fieldFilter];
            if (committedInputFilter) filters.push(committedInputFilter);
            this.currentStoreFilter = new CompoundFilter({filters, op: 'AND'});
        } else if (!committedInputFilter) {
            this.currentStoreFilter = fieldFilter;
        } else {
            this.currentStoreFilter = new CompoundFilter({filters: [fieldFilter, committedInputFilter], op: 'AND'});
        }

        console.log(this.currentStoreFilter);

        store.setFilter(this.currentStoreFilter);
        this.isFiltered = !isEqual(this.committedFilter, this._initialFilter);
    }

    @action
    cancelAndUndoPendingFilter() {
        this.setPendingFilter(this.committedFilter);
        // this.commitPendingFilter();
        this.filterText = null;

        this.closePopover();
    }

    @action
    resetSetFilter() {
        this.committedFilter = {};
        this.setPendingFilter(this._initialFilter);
        this.commitPendingFilter();
    }

    @action
    resetInputFilter() {
        this.inputVal = null;
        this.commitInputFilter();
    }

    openPopover() {
        this.setIsOpen(true);
    }

    closePopover() {
        this.setIsOpen(false);
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
