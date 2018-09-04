/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {textArea} from '@xh/hoist/kit/blueprint';

import {HoistField} from './HoistField';

/**
 * A Text Area Field
 *
 * @see HoistField for properties additional to those documented below.
 */
@HoistComponent()
export class TextAreaField extends HoistField {

    static propTypes = {
        ...HoistField.propTypes,

        /** Value of the control */
        value: PT.string,

        /** Whether field should receive focus on render */
        autoFocus: PT.bool,
        /** Text to display when control is empty */
        placeholder: PT.string,
        /** Whether to allow browser spell check, defaults to true */
        spellCheck: PT.bool,
        /** Whether text in field is selected when field receives focus */
        selectOnFocus: PT.bool
    };
    
    delegateProps = ['className', 'disabled', 'type', 'placeholder', 'autoFocus'];

    render() {
        const {style, width, spellCheck} = this.props;

        return textArea({
            value: this.renderValue || '',
            onChange: this.onChange,
            onKeyPress: this.onKeyPress,
            onBlur: this.onBlur,
            onFocus: this.onTextAreaFieldFocus,
            style: {...style, width},
            spellCheck: spellCheck !== false,
            ...this.getDelegateProps()
        });
    }

    onChange = (ev) => {
        this.noteValueChange(ev.target.value);
    }

    onKeyPress = (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) this.doCommit();
    }

    onTextAreaFieldFocus = (ev) => {
        if (this.props.selectOnFocus === true) {
            ev.target.select();
        }
        this.onFocus();
    }
}
export const textAreaField = elemFactory(TextAreaField);