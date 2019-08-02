/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import PT from 'prop-types';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {button as bpButton} from '@xh/hoist/kit/blueprint';

import './Button.scss';


/**
 * Wrapper around Blueprint's Button component. Defaults to the `minimal` style for reduced chrome
 * and adds LayoutSupport for top-level sizing and margin/padding props.
 *
 * Relays all other props supported by Blueprint's button.
 */
@HoistComponent
@LayoutSupport
export class Button extends Component {

    static propTypes = {
        /** True to attempt to auto-focus this button on render. */
        autoFocus: PT.bool,

        /** Optional icon to display along with or instead of text. */
        icon: PT.element,

        /** True (default) to show a "flat" button with icon/text only - no 3D gradient. */
        minimal: PT.bool,

        /** Callback when clicked, passed click event. */
        onClick: PT.func,

        /** Style props - will be merged with any styles specified via layoutSupport props. */
        style: PT.object,

        /** Primary label - provide this and/or icon. */
        text: PT.string,

        /** Text for title attribute to provide basic tooltip support. */
        title: PT.string
    };

    baseClassName = 'xh-button';

    render() {
        const {icon, text, onClick, minimal = true, style, autoFocus, ...rest} = this.getNonLayoutProps(),
            classes = [];

        if (minimal) classes.push('xh-button--minimal');
        if (autoFocus) classes.push('xh-button--autofocus-enabled');

        return bpButton({
            icon,
            minimal,
            onClick,
            text,
            autoFocus,

            style: {
                ...style,
                ...this.getLayoutProps()
            },

            ...rest,
            className: this.getClassName(classes)
        });
    }

}
export const button = elemFactory(Button);