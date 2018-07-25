/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {button as onsenButton} from '@xh/hoist/kit/onsen';
import {hspacer} from '@xh/hoist/cmp/layout';

/**
 * Wrapper around Onsen's Button component.
 * Hoist's most basic button accepts any props supported by Onsen's Button.
 *
 * Must be provided an onClick handler.
 */
@HoistComponent()
export class Button extends Component {

    static propTypes = {
        icon: PT.element,
        text: PT.string,
        modifier: PT.string,
        onClick: PT.func
    };

    render() {
        const {icon, text, modifier, onClick, ...rest} = this.props,
            items = [];

        if (icon && text) {
            items.push(icon, hspacer(10), text);
        } else if (icon) {
            items.push(icon);
        } else {
            items.push(text);
        }

        return onsenButton({
            cls: 'xh-button',
            items,
            modifier,
            onClick,
            ...rest
        });
    }

}
export const button = elemFactory(Button);