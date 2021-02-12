/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistInputModel, HoistInputPropTypes, useHoistInputModel} from '@xh/hoist/cmp/input';
import {hoistCmp} from '@xh/hoist/core';
import {div} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {inputGroup} from '@xh/hoist/kit/blueprint';
import {withDefault} from '@xh/hoist/utils/js';
import {getLayoutProps, getNonLayoutProps} from '@xh/hoist/utils/react';
import {isEmpty} from 'lodash';
import composeRefs from '@seznam/compose-react-refs';
import PT from 'prop-types';

/**
 * A single-line text input with additional support for embedded icons/elements.
 */
export const [TextInput, textInput] = hoistCmp.withFactory({
    displayName: 'TextInput',
    className: 'xh-text-input',
    render(props, ref) {
        return useHoistInputModel(cmp, props, ref, Model);
    }
});
TextInput.propTypes = {
    ...HoistInputPropTypes,

    value: PT.string,

    /**
     *  HTML `autocomplete` attribute to set on underlying <input> element.
     *
     *  Defaults to non-valid value 'nope' for fields of type text and 'new-password' for fields
     *  of type 'password' to defeat browser auto-completion, which is typically not desired in
     *  Hoist applications. Set to 'on' or a more specific autocomplete token to enable.
     *
     * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls%3A-the-autocomplete-attribute
     * @see https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
     */
    autoComplete: PT.string,

    /** True to focus the control on render. */
    autoFocus: PT.bool,

    /** True to commit on every change/keystroke, default false. */
    commitOnChange: PT.bool,

    /** True to show a "clear" button as the right element. default false */
    enableClear: PT.bool,

    /** Ref handler that receives HTML <input> element backing this component. */
    inputRef: PT.oneOfType([PT.instanceOf(Function), PT.instanceOf(Object)]),

    /** Icon to display inline on the left side of the input. */
    leftIcon: PT.element,

    /** Callback for normalized keydown event. */
    onKeyDown: PT.func,

    /** Text to display when control is empty. */
    placeholder: PT.string,

    /** Element to display inline on the right side of the input. */
    rightElement: PT.element,

    /** True to display with rounded caps. */
    round: PT.bool,

    /** True to select contents when control receives focus. */
    selectOnFocus: PT.bool,

    /** Alignment of entry text within control, default 'left'. */
    textAlign: PT.oneOf(['left', 'right']),

    /** True to allow browser spell check, default false. */
    spellCheck: PT.bool,

    /** Underlying HTML <input> element type. */
    type: PT.oneOf(['text', 'password'])
};
TextInput.hasLayoutSupport = true;


//-----------------------
// Implementation
//-----------------------

class Model extends HoistInputModel {

    get commitOnChange() {
        return withDefault(this.props.commitOnChange, false);
    }

    onChange = (ev) => {
        let {value} = ev.target;
        if (value === '') value = null;
        this.noteValueChange(value);
    };

    onKeyDown = (ev) => {
        if (ev.key === 'Enter') this.doCommit();
        if (this.props.onKeyDown) this.props.onKeyDown(ev);
    }

    onFocus = (ev) => {
        if (this.props.selectOnFocus && ev.target.nodeName === 'INPUT') {
            ev.target.select();
        }

        this.noteFocused();
    }
}

const cmp = hoistCmp.factory(
    ({model, className, ...props}, ref) => {
        const {width, flex, ...layoutProps} = getLayoutProps(props),
            // remove layoutProps, props not recognized as DOM elements, and props not accepted on BP's inputGroup component
            {bind, commitOnChange, enableClear, onCommit, selectOnFocus, textAlign, ...rest} = getNonLayoutProps(props);

        const isClearable = !isEmpty(model.internalValue);

        return div({
            item: inputGroup({
                ...rest,

                // overwrite some of the ...rest props with Hoist's customizations
                value: model.renderValue || '',

                autoComplete: withDefault(rest.autoComplete, rest.type === 'password' ? 'new-password' : 'nope'),
                inputRef: composeRefs(model.inputRef, rest.inputRef),
                rightElement: rest.rightElement ||
                    (enableClear && !rest.disabled && isClearable ? clearButton() : null),
                round: withDefault(rest.round, false),
                spellCheck: withDefault(rest.spellCheck, false),

                style: {
                    ...rest.style,
                    ...layoutProps,
                    textAlign: withDefault(textAlign, 'left')
                },

                onChange: model.onChange,
                onKeyDown: model.onKeyDown
            }),

            className,
            style: {
                width: withDefault(width, 200),
                flex: withDefault(flex, null)
            },

            onBlur: model.onBlur,
            onFocus: model.onFocus,
            ref
        });
    }
);

const clearButton = hoistCmp.factory(
    ({model}) => button({
        icon: Icon.cross(),
        tabIndex: -1,
        minimal: true,
        onClick: () => {
            model.noteValueChange(null);
            model.doCommit();
        }
    })
);
