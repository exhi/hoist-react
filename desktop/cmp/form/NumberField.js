/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {numericInput} from '@xh/hoist/kit/blueprint';
import {fmtNumber} from '@xh/hoist/format';
import {HoistField} from '@xh/hoist/cmp/form';

/**
 * A Number Input Field
 *
 * @see HoistField for properties additional to those documented below.
 */
@HoistComponent
export class NumberField extends HoistField {

    static propTypes = {
        ...HoistField.propTypes,

        /** Value of the control */
        value: PT.number,

        /** Text to display when control is empty */
        placeholder: PT.string,
        /** minimum value */
        min: PT.number,
        /** maximum value */
        max: PT.number,
        /** Number of decimal places to allow on field's value, defaults to 4 */
        precision: PT.number,
        /** Allow/automatically fill in trailing zeros in accord with precision, defaults to false */
        zeroPad: PT.bool,
        /** Set to true for advanced input evaluation, defaults to false.
            Inputs suffixed with k, m, or b will be calculated as thousands, millions, or billions respectively */
        enableShorthandUnits: PT.bool,
        /** Whether to display large values with commas */
        displayWithCommas: PT.bool,
        /** Alignment of numbers in field, default to 'right' */
        textAlign: PT.oneOf(['left', 'right']),
        /** Icon to display on the left side of the field */
        leftIcon: PT.element,
        /** Whether text in field is selected when field receives focus */
        selectOnFocus: PT.bool
    };

    static shorthandValidator = /((\.\d+)|(\d+(\.\d+)?))(k|m|b)\b/gi;

    delegateProps = ['className', 'disabled', 'min', 'max', 'placeholder', 'leftIcon'];

    baseClassName = 'xh-number-field';

    render() {
        const {width, style, enableShorthandUnits} = this.props,
            textAlign = this.props.textAlign || 'right';

        return numericInput({
            className: this.getClassName(),
            value: this.renderValue,
            onValueChange: this.onValueChange,
            onKeyPress: this.onKeyPress,
            onBlur: this.onBlur,
            onFocus: this.onNumberFieldFocus,
            style: {textAlign, width, ...style},
            buttonPosition: 'none',
            allowNumericCharactersOnly: !enableShorthandUnits,
            ...this.getDelegateProps()
        });
    }

    onValueChange = (val, valAsString) => {
        this.noteValueChange(valAsString);
    }

    onKeyPress = (ev) => {
        if (ev.key === 'Enter') this.doCommit();
    }

    toExternal(value) {
        value = this.parseValue(value);
        return isNaN(value) ? null : value;
    }

    toInternal(value) {
        if (value == null) return '';
        const props = this.props,
            precision = props.precision != null ? props.precision : 4,
            zeroPad = !!props.zeroPad,
            formattedVal = fmtNumber(value, {precision, zeroPad});

        return props.displayWithCommas ? formattedVal : formattedVal.replace(/,/g, '');
    }

    parseValue(value) {
        value = value.replace(/,/g, '');

        if (NumberField.shorthandValidator.test(value)) {

            const num = +value.substring(0, value.length - 1),
                lastChar = value.charAt(value.length - 1).toLowerCase();

            switch (lastChar) {
                case 'k':
                    return num * 1000;
                case 'm':
                    return num * 1000000;
                case 'b':
                    return num * 1000000000;
                default:
                    return NaN;
            }

        }

        return parseFloat(value);
    }

    onNumberFieldFocus = (ev) => {
        if (this.props.selectOnFocus === true) {
            ev.target.select();
        }
        this.onFocus();
    }
}
export const numberField = elemFactory(NumberField);