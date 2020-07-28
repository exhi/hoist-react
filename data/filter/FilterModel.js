/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {HoistModel} from '@xh/hoist/core';
import {observable, bindable, action} from '@xh/hoist/mobx';
import {isEmpty, isPlainObject, groupBy, every, some, values, castArray} from 'lodash';

import {FieldFilter} from './FieldFilter';
import {FunctionFilter} from './FunctionFilter';

@HoistModel
export class FilterModel {

    /** @member {Filter[]} */
    @observable.ref
    filters = null;

    /** @member {function(v: (Record|Object)):boolean} */
    test = null;

    /** @member {Boolean} */
    @bindable
    includeChildren;

    /**
     * @param {Object} c - FilterModel configuration.
     * @param {(Filter[]|Object[])} [c.filters] - collection of filters, or configs to create them.
     * @param {boolean} [c.includeChildren] - true if all children of a passing record should
     *      also be considered passing (default false).
     */
    constructor({
        filters = [],
        includeChildren = false
    } = {}) {
        this.filters = this.parseFilters(filters);
        this.includeChildren = includeChildren;
        this.updateTestFunction();
    }

    /**
     * Sets filters to the filter model.
     * @param {(Filter|Filter[]|string|string[]|Object|Object[])} filters - filters, filter strings or configs.
     */
    @action
    setFilters(filters) {
        this.filters = this.parseFilters(filters);
        this.updateTestFunction();
    }

    /**
     * Adds filters to the filter model. If a matching filter already exists, it will be skipped.
     * @param {(Filter|Filter[]|string|string[]|Object|Object[])} filters - filters, filter strings or configs to add.
     */
    @action
    addFilters(filters) {
        filters = this.parseFilters(filters);
        const toAdd = filters.filter(f => {
            return every(this.filters, it => !it.equals(f));
        });
        this.filters = [...this.filters, ...toAdd];
        this.updateTestFunction();
    }

    /**
     * Removes filters from the filter model.
     * @param {(Filter|Filter[]|string|string[]|Object|Object[])} filters - filters, filter strings or configs to remove.
     */
    @action
    removeFilters(filters) {
        filters = this.parseFilters(filters);
        this.filters = this.filters.filter(f => {
            return every(filters, it => !it.equals(f));
        });
        this.updateTestFunction();
    }

    /**
     * Removes all filters from the filter model.
     */
    @action
    clearFilters() {
        this.filters = [];
    }

    /**
     * Convenience method to replace any matching Filters with a new set of Filters
     * @param {(Filter|Filter[]|string|string[]|Object|Object[])} filters - new filters. Any matching filters will be replaced.
     */
    @action
    replaceFilters(filters) {
        this.removeFilters(filters);
        this.addFilters(filters);
    }

    //------------------------
    // Implementation
    //------------------------
    updateTestFunction() {
        this.test = this.createTestFunction();
    }

    /**
     * Creates a function that tests a Record or Object against all the Filters.
     * FunctionFilters and FieldFilters across disparate fields are applied using AND.
     * FieldFilters that share a field and operator are applied using OR.
     */
    createTestFunction() {
        const {filters} = this;
        if (isEmpty(filters)) return () => true;

        const groups = values(groupBy(filters, f => {
            return f.isFieldFilter ? f.field + '|' + f.operator : f.id;
        }));

        return (v) => {
            return every(groups, groupedFilters => {
                return some(groupedFilters, f => f.test(v));
            });
        };
    }

    parseFilters(filters) {
        if (!filters) return [];
        return castArray(filters).map(f => this.parseFilter(f));
    }

    parseFilter(filter) {
        if (filter instanceof FieldFilter || filter instanceof FunctionFilter) return filter;
        if (isPlainObject(filter) && filter.testFn) return new FunctionFilter(filter);
        return FieldFilter.parse(filter);
    }
}