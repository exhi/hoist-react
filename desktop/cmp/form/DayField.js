/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import moment from 'moment';
import {assign} from 'lodash';

import {fmtDate} from '@xh/hoist/format';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {dateInput} from '@xh/hoist/kit/blueprint';

import {HoistField} from './HoistField';

/**
 * A Calendar Control for choosing a Day.
 *
 * @see HoistField for properties additional to those documented below.
 */
@HoistComponent()
export class DayField extends HoistField {

    static propTypes = {
        ...HoistField.propTypes,

        /** Value of the control */
        value: PT.string,

        /** Position for calendar popover. @see http://blueprintjs.com/docs/ */
        popoverPosition: PT.oneOf([
            'top-left', 'top', 'top-right',
            'right-top', 'right', 'right-bottom',
            'bottom-right', 'bottom', 'bottom-left',
            'left-bottom', 'left', 'left-top',
            'auto'
        ]),

        /** Props passed to ReactDayPicker component. @see http://react-day-picker.js.org/ */
        dayPickerProps: PT.object,
        /** Icon to display on the left side of the field */
        leftIcon: PT.element,
        /** Element to display on the right side of the field */
        rightElement: PT.element
    };

    delegateProps = ['className', 'disabled', 'rightElement'];

    render() {
        let {width, popoverPosition, style, dayPickerProps, leftIcon} = this.props;

        dayPickerProps = assign({fixedWeeks: true}, dayPickerProps);

        return dateInput({
            value: this.renderValue,
            onChange: this.onChange,
            formatDate: this.formatDate,
            parseDate: this.parseDate,
            inputProps: {
                style: {...style, width},
                onKeyPress: this.onKeyPress,
                onBlur: this.onBlur,
                onFocus: this.onFocus,
                leftIcon
            },
            popoverProps: {
                minimal: true,
                usePortal: true,
                position: popoverPosition || 'auto',
                popoverWillClose: this.onPopoverWillClose
            },
            dayPickerProps,
            ...this.getDelegateProps()
        });
    }

    formatDate(date) {
        return fmtDate(date);
    }

    parseDate(dateString) {
        return moment(dateString, 'YYYY-MM-DD', true).toDate();
    }

    onChange = (date) => {
        this.noteValueChange(date);
    }

    onKeyPress = (ev) => {
        if (ev.key == 'Enter') this.doCommit();
    }

    onPopoverWillClose = (ev) => {
        this.doCommit();
    }
}
export const dayField = elemFactory(DayField);