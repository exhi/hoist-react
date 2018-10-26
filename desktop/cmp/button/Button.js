/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {withDefault} from '@xh/hoist/utils/js';
import {Component} from 'react';
import PT from 'prop-types';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {button as bpButton} from '@xh/hoist/kit/blueprint';

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
        icon: PT.element,
        text: PT.string,
        onClick: PT.func
    };

    baseClassName = 'xh-button';

    render() {
        const {icon, text, onClick, minimal, style, ...rest} = this.props;
        return bpButton({
            icon,
            text,
            onClick,
            minimal: withDefault(minimal, true),
            style: {
                ...style,
                ...this.getLayoutProps()
            },
            ...rest,
            className: this.getClassName()
        });
    }

}
export const button = elemFactory(Button);