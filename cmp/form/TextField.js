/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {hoistComponent, elemFactory} from 'hoist/core';
import {inputGroup} from 'hoist/kit/blueprint';

import {HoistField} from './HoistField';

/**
 * A Text Input Field
 *
 * @prop autoFocus
 * @prop type, 'text' or 'password'
 * @prop placeholder, text to display when control is empty
 * @prop width, width of field, in pixels,
 */
@hoistComponent()
export class TextField extends HoistField {
    
    delegateProps = ['className', 'disabled', 'type', 'placeholder', 'autoFocus'];

    render() {
        const {style, width} = this.props;

        return inputGroup({
            value: this.renderValue || '',
            onChange: this.onChange,
            onKeyPress: this.onKeyPress,
            onBlur: this.onBlur,
            onFocus: this.onFocus,
            style: {...style, width},
            ...this.getDelegateProps()
        });
    }

    onChange = (ev) => {
        this.noteValueChange(ev.target.value);
    }
    
    onKeyPress = (ev) => {
        if (ev.key === 'Enter') {
            this.doCommit();
        }
    }

    onBlur = (ev) => {
        this.doCommit();
    }
}
export const textField = elemFactory(TextField);