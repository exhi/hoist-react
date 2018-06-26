/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {button as bpButton} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';

/**
 * Wrapper around Blueprint's Button component.
 * Hoist's most basic button accepts any props supported by Blueprint's Button.
 *
 * Must be provided an onClick handler.
 */
@HoistComponent()
export class Button extends Component {

    static propTypes = {
        onClick: PT.func
    };

    render() {
        const {onClick, ...rest} = this.props;
        return bpButton({
            onClick: onClick,
            ...rest
        });
    }

}
export const button = elemFactory(Button);