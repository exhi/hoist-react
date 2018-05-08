/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {isObject, find} from 'lodash';
import {menuItem} from 'hoist/kit/blueprint';

import {HoistField} from '../HoistField';

/**
 * BaseDropdownField
 *
 * Abstract class supporting BaseComboField and SelectField.
 */
export class BaseDropdownField extends HoistField {

    static propTypes = {
        /** Text to display when control is empty */
        placeholder: PT.string
    };

    static defaultProps = {
        placeholder: 'Select'
    }

    //-----------------------------------------------------------
    // Common handling of options, rendering of selected option
    //-----------------------------------------------------------
    normalizeOptions(options) {
        return options.map(o => {
            const ret = isObject(o) ?
                {label: o.label, value: o.value} :
                {label: o != null ? o.toString() : '-null-', value: o};

            ret.value = this.toInternal(ret.value);
            return ret;
        });
    }

    getOptionRenderer() {
        return this.props.optionRenderer || this.defaultOptionRenderer;
    }

    defaultOptionRenderer(option, optionProps) {
        return menuItem({
            key: option.value,
            text: option.label,
            onClick: optionProps.handleClick,
            active: optionProps.modifiers.active
        });
    }

    //---------------------------------------------------------------------------
    // Handling of null values.  Blueprint doesn't allow null for the value of a
    // dropdown control, but we can use a sentinel value to represent it.
    //----------------------------------------------------------------------------
    toExternal(internal) {
        return internal === NULL_VALUE ? null : internal;
    }

    toInternal(external) {
        return external ===  null ? NULL_VALUE : external;
    }

    getDisplayValue(value, items, placeholder) {
        const match = find(items, {value});

        if (match) return match.label;
        return (value == null || value === NULL_VALUE) ? placeholder : value.toString();
    }

    onItemSelect = (val) => {
        this.noteValueChange(val.value);
        this.doCommit();
    }
}

const NULL_VALUE = 'xhNullValue';