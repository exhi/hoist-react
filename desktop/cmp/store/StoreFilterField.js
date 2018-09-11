/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {debounce, escapeRegExp} from 'lodash';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {observable, action, runInAction} from '@xh/hoist/mobx';
import {button} from '@xh/hoist/desktop/cmp/button';
import {textField} from '@xh/hoist/desktop/cmp/form';
import {Icon} from '@xh/hoist/icon';
import {BaseStore} from '@xh/hoist/data';
import {withDefault} from '@xh/hoist/utils/js';

/**
 * A Component that can bind to any store and filter it
 * based on simple text matching in specified fields.
 */
@HoistComponent
export class StoreFilterField extends Component {

    static propTypes = {
        /** Names of fields in store's records to filter by */
        fields: PT.arrayOf(PT.string).isRequired,
        /** Callback to return updated filter. */
        onFilterChange: PT.func,
        /** Initial empty text */
        placeholder: PT.string,
        /**
         * Store to filter (optional).  If specified this control will bind directly to
         * this this store and filter its contents.
         */
        store: PT.instanceOf(BaseStore),
        /**
         * Delay (in ms) used to buffer filtering of the store after the value changes from user
         * input (default is 200ms). Set to 0 to filter immediately after user input.  Only used
         * when 'store' is specified.
         */
        filterBuffer: PT.number
    };

    @observable value = '';
    filter = null;
    applyFilterFn = null;
    baseClassName = 'xh-store-filter-field';

    constructor(props) {
        super(props);

        if (props.store) {
            const filterBuffer = withDefault(props.filterBuffer, 200);
            this.applyFilterFn = debounce(
                () => this.applyStoreFilter(),
                filterBuffer
            );
        }
    }

    render() {
        return textField({
            placeholder: withDefault(this.props.placeholder, 'Quick filter'),
            value: this.value,
            onChange: this.onValueChange,
            leftIcon: Icon.filter(),
            rightElement: button({
                icon: Icon.x(),
                minimal: true,
                onClick: this.onClearClick
            }),
            className: this.getClassName()
        });
    }

    //------------------------
    // Implementation
    //------------------------
    @action
    setValue(v, applyFilterImmediately = false) {
        const {fields, onFilterChange} = this.props,
            {applyFilterFn} = this;

        this.value = v;

        // 0) Regenerate filter
        let searchTerm = escapeRegExp(this.value);

        let filter = null;
        if (searchTerm && fields.length) {
            filter = (rec) => fields.some(f => {
                const fieldVal = rec[f];
                return fieldVal && new RegExp('(^|\\W)' + searchTerm, 'ig').test(fieldVal);
            });
        }
        this.filter = filter;

        // 1) Notify listeners and/or reapply
        if (onFilterChange) onFilterChange(filter);
        if (applyFilterFn) {
            if (applyFilterImmediately) {
                applyFilterFn.cancel();
                this.applyStoreFilter();
            } else {
                applyFilterFn();
            }
        }
    }

    applyStoreFilter() {
        this.props.store.setFilter(this.filter);
    }

    onValueChange = (v) => {
        this.setValue(v);
    };

    onClearClick = () => {
        this.setValue('', true);
    }

}

export const storeFilterField = elemFactory(StoreFilterField);