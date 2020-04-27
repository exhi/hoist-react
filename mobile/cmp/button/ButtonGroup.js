/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {hbox} from '@xh/hoist/cmp/layout';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {Button} from '@xh/hoist/mobile/cmp/button';
import {throwIf} from '@xh/hoist/utils/js';
import {castArray} from 'lodash';
import {Component} from 'react';
import './ButtonGroup.scss';

/**
 * A segmented group of buttons. Should receive a list of Buttons as a children.
 */
@HoistComponent
@LayoutSupport
export class ButtonGroup extends Component {

    baseClassName = 'xh-button-group';

    render() {
        const {children, ...rest} = this.getNonLayoutProps(),
            buttons = castArray(children);

        buttons.forEach(button => {
            throwIf(button && button.type !== Button, 'ButtonGroup child must be a Button.');
        });

        return hbox({
            items: buttons,
            ...rest,
            ...this.getLayoutProps(),
            className: this.getClassName()
        });
    }
}

export const buttonGroup = elemFactory(ButtonGroup);