/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HoistInput} from '@xh/hoist/cmp/input';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {input} from '@xh/hoist/kit/onsen';
import {withDefault} from '@xh/hoist/utils/js';
import PT from 'prop-types';
import './TextInput.scss';

/**
 * A Text Input
 */
@HoistComponent
@LayoutSupport
export class TextInput extends HoistInput {

    static propTypes = {
        ...HoistInput.propTypes,
        value: PT.string,

        /**
         *  HTML `autocomplete` attribute to set on underlying <input> element.
         *
         *  Defaults to non-valid value 'nope' for fields of type text and 'new-password' for fields
         *  of type 'password' to defeat browser auto-completion, which is typically not desired in
         *  Hoist applications. Set to 'on' or a more specific autocomplete token to enable.
         *
         * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls%3A-the-autocomplete-attribute
         * See https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
         */
        autoComplete: PT.string,

        /** True to commit on every change/keystroke, default false. */
        commitOnChange: PT.bool,

        /** Onsen modifier string */
        modifier: PT.string,

        /** Function which receives keydown event */
        onKeyDown: PT.func,

        /** Text to display when control is empty */
        placeholder: PT.string,

        /** Whether text in field is selected when field receives focus */
        selectOnFocus: PT.bool,

        /** Whether to allow browser spell check, defaults to false */
        spellCheck: PT.bool,

        /** Alignment of entry text within control, default 'left'. */
        textAlign: PT.oneOf(['left', 'right']),

        /** Underlying HTML <input> element type. */
        type: PT.oneOf(['text', 'password'])
    };

    baseClassName = 'xh-text-input';

    get commitOnChange() {
        return withDefault(this.props.commitOnChange, false);
    }

    render() {
        const props = this.getNonLayoutProps(),
            {width, ...layoutProps} = this.getLayoutProps();

        return input({
            value: this.renderValue || '',

            autoComplete: withDefault(props.autoComplete, props.type == 'password' ? 'new-password' : 'nope'),
            disabled: props.disabled,
            modifier: props.modifier,
            placeholder: props.placeholder,
            spellCheck: withDefault(props.spellCheck, false),
            tabIndex: props.tabIndex,
            type: props.type,

            className: this.getClassName(),
            style: {
                ...props.style,
                ...layoutProps,
                width: withDefault(width, null),
                textAlign: withDefault(props.textAlign, 'left')
            },

            onChange: this.onChange,
            onKeyDown: this.onKeyDown,
            onBlur: this.onBlur,
            onFocus: this.onFocus
        });
    }

    onChange = (ev) => {
        let {value} = ev.target;
        if (value === '') value = null;
        this.noteValueChange(value);
    };

    onKeyDown = (ev) => {
        const {onKeyDown} = this.props;
        if (ev.key === 'Enter') this.doCommit();
        if (onKeyDown) onKeyDown(ev);
    };

    onFocus = (ev) => {
        if (this.props.selectOnFocus && ev.target && ev.target.select) {
            ev.target.select();
        }
        this.noteFocused();
    };
}
export const textInput = elemFactory(TextInput);