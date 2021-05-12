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
    compact,
    difference,
    filter,
    findIndex,
    isArray,
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
                if (!open) impl.cancelAndUndoFilters();
            },
            target: div({
                item: isFiltered ? Icon.filter() : Icon.bars(),
                onClick: (e) => {
                    e.stopPropagation();
                    impl.openMenu();
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
                                value: 'customFilter',
                                text: 'Custom',
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
                                    impl.resetCustomFilter();
                            }
                        }),
                        filler(),
                        button({
                            text: 'Cancel',
                            onClick: () => impl.cancelAndUndoFilters()
                        }),
                        button({
                            icon: Icon.check(),
                            text: 'Apply',
                            intent: 'success',
                            onClick: () => {
                                isSetFilter ?
                                    impl.commitSetFilter() :
                                    impl.commitCustomFilter();
                            }
                        })
                    ]
                })
            })
        });
    }
});

const customFilter = hoistCmp.factory({
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
    enableFilter;

    _doubleClick = false;
    _lastTouch = null;
    _lastTouchStart = null;
    _lastMouseDown = null;

    //-------------------
    // Filter Menu Support
    //-------------------
    @observable.ref
    storeFilter = null; // `gridModel.store.filter`

    /**
     * @member {Store} - Store to be kept in sync with `gridModel.store,` with filters applied
     * to obtain set values for display in enumerated set filter. i.e. excluding any '=' op
     * `FieldFilter` on `colId`. Only filtered `records` will be loaded into `setFilterGridModel`.
     */
    @managed
    virtualStore;

    /**
     * @member {GridModel} - Checkbox grid to display enumerated set of record values to add
     * or remove from `gridModel.store.filter`
     */
    @managed @observable.ref
    setFilterGridModel;

    @managed
    tabContainerModel = new TabContainerModel({
        tabs: [
            {
                id: 'setFilter',
                title: 'Set',
                content: () => grid({
                    model: this.setFilterGridModel,
                    height: 226,
                    width: 240 // TODO - fix styling
                })
            },
            {
                id: 'customFilter',
                title: 'Custom',
                content: () => customFilter({model: this})
            }
        ],
        switcher: false
    });
    @bindable tabId = null;

    @bindable isOpen = false; // Controlled popover filter menu

    /**
     * @member {Object} Key-value pairs of enumerated value to boolean, indicating whether value is
     * checked/unchecked (i.e. included in '=' `FieldFilter`)
     */
    _initialSetFilter = {}; // All `virtualStore` record values for column (with no filter applied, all true)
    @observable.ref committedSetFilter = {}; // All `virtualStore` record values in committed filter state
    @observable.ref pendingSetFilter = {}; // Local state of enumerated values loaded in `setFilterGridModel`

    @bindable filterText = null; // Bound search term for `setFilterGridModel`'s `StoreFilterField`
    virtualStoreLastUpdated = null; // Kept in sync with `gridModel.store` to avoid unnecessary updates

    // Custom Filter support
    @bindable op = '!=';
    @bindable inputVal = null;
    @bindable committedCustomFilter = null;

    get isFiltered() {
        if (!this.storeFilter) return false;
        return !isEmpty(this.getColFilters(this.storeFilter.filters ?? [this.storeFilter]));
    }

    get customFilter() {
        if (!this.op || isNull(this.inputVal)) return null;
        return new FieldFilter({
            field: this.colId,
            op: this.op,
            value: this.inputVal.toString().trim()
        });
    }

    get type() {
        return this.virtualStore.getField(this.colId).type;
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

    //---------------------------
    // Filtering Public Actions
    //---------------------------
    openMenu() {
        this.setIsOpen(true);
        this.setTabId('setFilter');
    }

    closeMenu() {
        this.setIsOpen(false);
    }

    @action
    toggleNode(isChecked, value) {
        const {pendingSetFilter} = this,
            currValue = {
                ...pendingSetFilter,
                [value]: isChecked
            };
        this.setPendingSetFilter(currValue);
    }

    @action
    toggleBulk(isChecked) {
        const {records} = this.setFilterGridModel.store,
            ret = clone(this.pendingSetFilter);
        for (let rec of records) {
            ret[rec.id] = isChecked;
        }
        this.setPendingSetFilter(ret);
    }

    @action
    resetSetFilter() {
        this.committedSetFilter = {};
        this.setPendingSetFilter(this._initialSetFilter);
        this.commitSetFilter();
    }

    @action
    resetCustomFilter() {
        this.inputVal = null;
        this.commitCustomFilter();
    }

    @action
    cancelAndUndoFilters() {
        this.setPendingSetFilter(this.committedSetFilter);
        this.setPendingCustomFilter(this.committedCustomFilter);
        this.filterText = null;
        this.closeMenu();
    }

    @action
    commitCustomFilter() {
        const {customFilter, colId, gridModel, op, committedCustomFilter} = this,
            {store} = gridModel,
            {filter} = store;

        // If existing store filter, remove committed custom filter if any,
        // or remove custom input value OR'd with any '=' field filter
        if (filter) {
            const currStoreFilters = filter?.filters ?? [filter],
                colFilters = this.getColFilters(currStoreFilters),
                currCommittedCustomFilter = colFilters?.find(it => it.equals(committedCustomFilter)),
                currEqualsFilterIncludingCustomValue = colFilters?.find(it => (
                    isArray(it.value) ?
                        it.value.includes(committedCustomFilter?.value) :
                        it.value === committedCustomFilter?.value) && it.op === '=');

            if (currCommittedCustomFilter) {
                const newFilters = compact([
                    ...without(currStoreFilters, ...colFilters),
                    ...without(colFilters, currCommittedCustomFilter)
                ]);
                this.storeFilter = newFilters.length > 1 ?
                    new CompoundFilter({filters: newFilters, op: 'AND'}) :
                    newFilters;
            } else if (currEqualsFilterIncludingCustomValue) {
                const newValue = without(currEqualsFilterIncludingCustomValue.value, committedCustomFilter.value),
                    newEqualFieldFilter = new FieldFilter({
                        field: this.colId,
                        value: newValue,
                        op: '='
                    }),
                    newFilters = compact([
                        ...without(currStoreFilters, ...colFilters),
                        ...without(colFilters, currEqualsFilterIncludingCustomValue),
                        newEqualFieldFilter
                    ]);
                this.storeFilter = newFilters.length > 1 ?
                    new CompoundFilter({filters: newFilters, op: 'AND'}) :
                    newFilters;
            }
            if (isEmpty(this.storeFilter)) this.storeFilter = null;
        }
        // 1) Set new filter with current committed filter removed
        if (!customFilter) {
            this.committedCustomFilter = null;
            store.setFilter(this.storeFilter);
            // Re-commit existing set filter
            this.commitSetFilter();
            return;
        }

        // 2) Apply new custom filter
        const {storeFilter} = this;
        if (storeFilter?.isCompoundFilter) {
            const equalsFilter = this.getEqualsColFilter(storeFilter.filters);
            if (equalsFilter && op === '=') {
                const newFilters = compact([...without(storeFilter.filters, equalsFilter), customFilter]);
                this.storeFilter = newFilters.length > 1 ?
                    new CompoundFilter({filters: newFilters, op: 'AND'}) :
                    customFilter;
            } else {
                const newFilters = [...storeFilter.filters, customFilter];
                this.storeFilter = new CompoundFilter({filters: newFilters, op: 'AND'});
            }
        } else if (filter?.isFieldFilter && (filter.field !== colId || op !== '=')) {
            this.storeFilter = new CompoundFilter({filters: [filter, customFilter], op: 'AND'});
        } else {
            this.storeFilter = customFilter;
        }
        // If custom filter is '=', mark value as checked in committed set filter
        if (customFilter?.op === '=' && this.committedSetFilter.hasOwnProperty(customFilter.value)) {
            this.committedSetFilter[customFilter.value] = true;
        }
        this.committedCustomFilter = customFilter;
        store.setFilter(this.storeFilter);
    }

    @action
    commitSetFilter() {
        const {pendingSetFilter, colId, type, gridModel, committedCustomFilter} = this,
            ret = clone(this.committedSetFilter);

        // Sync committed set filter with new pending values
        for (const val in pendingSetFilter) {
            ret[val] = pendingSetFilter[val];
        }
        this.committedSetFilter = ret;

        let value = keys(pickBy(ret, v => v));
        // Include any equal input values from custom filter
        if (committedCustomFilter?.op === '=') {
            value.push(committedCustomFilter.value);
            value = uniq(value);
        }
        // Parse boolean strings to their primitive values
        if (type === 'bool') {
            value = value.map(it => {
                if (it === 'true') return true;
                if (it === 'false') return false;
                return null;
            });
        }

        const {store} = gridModel,
            {filter} = store,
            fieldFilter = !isEqual(ret, this._initialSetFilter) ?
                new FieldFilter({
                    field: this.colId,
                    value,
                    op: '='
                }) :
                null;

        if (filter?.isCompoundFilter) {
            const equalsFilter = this.getEqualsColFilter(filter.filters),
                newFilters = compact([...without(filter.filters, equalsFilter), fieldFilter]);

            this.storeFilter = newFilters.length > 1 ?
                new CompoundFilter({filters: newFilters, op: 'AND'}) :
                newFilters[0];
        } else if (filter?.isFieldFilter && filter.field !== colId && fieldFilter) {
            this.storeFilter = new CompoundFilter({filters: [filter, fieldFilter], op: 'AND'});
        } else if (committedCustomFilter?.op !== '=' && fieldFilter) {
            this.storeFilter = new CompoundFilter({filters: [fieldFilter, committedCustomFilter], op: 'AND'});
        } else {
            this.storeFilter = fieldFilter;
        }

        store.setFilter(this.storeFilter);
    }

    //---------------------------
    // Filtering Implementation
    //---------------------------
    loadStoreAndUpdateFilter(filter, lastUpdated) {
        if (this.virtualStoreLastUpdated !== lastUpdated) {
            this.virtualStoreLastUpdated = lastUpdated;
            this.loadVirtualStore();
        }
        this.processAndSetFilter(filter);
    }

    loadVirtualStore() {
        const {virtualStore, gridModel, colId, committedSetFilter} = this,
            allRecords = gridModel.treeMode ?
                gridModel.store.allRecords
                    .filter(rec => isEmpty(rec.children))
                    .map(rec => rec.data) :
                gridModel.store.allRecords
                    .map(rec => rec.data);

        virtualStore.loadData(allRecords);

        const ret = {};
        uniqBy(allRecords, (rec) => rec[colId])
            .forEach(it => {
                const key = it[colId];
                ret[key] = committedSetFilter[key] ?? true;
            });

        this.committedSetFilter = ret;
        this._initialSetFilter = mapValues(ret, () => true);
    }

    @action
    processAndSetFilter(filter) {
        const {setFilterGridModel, virtualStore, committedSetFilter, committedCustomFilter} = this;
        if (!setFilterGridModel) return;

        const {colId} = this;
        if (!filter) {
            virtualStore.setFilter(null);
        } else if (filter.isCompoundFilter) {
            const equalsFilter = this.getEqualsColFilter(filter.filters),
                appliedFilters = without(filter.filters, equalsFilter);
            virtualStore.setFilter({op: 'AND', filters: appliedFilters});
        } else if (
            filter.isFieldFilter &&
            (
                filter.field !== colId ||
                filter.op !== '=' ||
                filter.equals(committedCustomFilter) // Only apply '=' field filter when it is a custom filter
            )
        ) {
            virtualStore.setFilter(filter);
        } else {
            virtualStore.setFilter(null);
        }

        const allVals = uniqBy(virtualStore.allRecords, (rec) => rec.data[colId]),
            visibleVals = uniqBy(virtualStore.records, (rec) => rec.data[colId]),
            hiddenVals = difference(allVals, visibleVals).map(rec => rec.data[colId]),
            currentVals = visibleVals.map(it => ({
                [colId]: it.data[colId],
                isChecked: committedSetFilter[it.data[colId]] || (committedCustomFilter?.value == it.data[colId] ?? false)
            }));

        // Only load set filter grid with VISIBLE values
        setFilterGridModel.loadData(currentVals);
        const ret = omit(committedSetFilter, hiddenVals);
        currentVals.forEach(rec => {
            if (!ret.hasOwnProperty(rec[colId])) {
                ret[rec[colId]] = committedSetFilter[rec[colId]] || (committedCustomFilter?.value == rec[colId] ?? false);
            }
        });
        this.setPendingSetFilter(ret);
    }

    @action
    setPendingSetFilter(currValue) {
        const {pendingSetFilter, setFilterGridModel} = this;
        if (isEqual(currValue, pendingSetFilter)) return;

        this.pendingSetFilter = currValue;
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
    setPendingCustomFilter(fieldFilter) {
        this.op = fieldFilter?.op ?? '!=';
        this.inputVal = fieldFilter?.value ?? null;
    }

    createSetFilterGridModel() {
        const {renderer, rendererIsComplex, headerName} = this.xhColumn; // Render values as they are in `gridModel`
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

    getColFilters(filters) {
        return filter(filters, {field: this.colId});
    }

    getEqualsColFilter(filters) {
        return this.getColFilters(filters).find(it => it.op === '=');
    }
    //-------------------
    // Sorting
    //-------------------
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

    //-------------------
    // Implementation
    //-------------------
    constructor({gridModel, xhColumn, column: agColumn}) {
        super();
        makeObservable(this);
        this.gridModel = gridModel;
        this.xhColumn = xhColumn;
        this.agColumn = agColumn;
        this.colId = agColumn.colId;
        this.enableSorting = xhColumn.sortable;
        this.enableFilter = xhColumn.enableFilter;
        this.availableSorts = this.parseAvailableSorts();

        if (this.enableFilter && xhColumn.field === this.colId) {
            const {store} = this.gridModel;

            this.setFilterGridModel = this.createSetFilterGridModel();
            this.virtualStore = new Store({...store, loadRootAsSummary: false});

            this.addReaction({
                track: () => [store.filter, store.lastUpdated],
                run: ([filter, lastUpdated]) => {
                    if (lastUpdated) this.loadStoreAndUpdateFilter(filter, lastUpdated);
                }
            });

            this.addReaction({
                track: () => this.tabId,
                run: (tabId) => this.tabContainerModel.activateTab(tabId)
            });
        }
    }

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
