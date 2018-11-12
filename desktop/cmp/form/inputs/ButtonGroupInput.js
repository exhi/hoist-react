/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import React from 'react';
import {castArray} from 'lodash';
import {HoistComponent, LayoutSupport, elemFactory} from '@xh/hoist/core';
import {ButtonGroup, buttonGroup} from '@xh/hoist/desktop/cmp/button';
import {throwIf, withDefault} from '@xh/hoist/utils/js';
import {HoistInput} from '@xh/hoist/cmp/form';

/**
 * A segmented group of buttons, one of which is depressed to indicate the input's current value.
 *
 * Should receive a list of Buttons as a children. Each Button requires a 'value' prop.
 * The buttons are automatically configured to set this value on click and appear pressed if the
 * ButtonGroupInput's value matches.
 */
@HoistComponent
@LayoutSupport
export class ButtonGroupInput extends HoistInput {

    static propTypes = {
        ...HoistInput.propTypes,
        ...ButtonGroup.propTypes
    };

    baseClassName = 'xh-button-group-input';

    render() {
        const {children, minimal, ...rest} = this.getNonLayoutProps(),
            buttons = castArray(children).map(button => {
                const {value} = button.props;

                throwIf(button.type.name !== 'Button', 'ButtonGroupInput child must be a Button.');
                throwIf(!value, 'ButtonGroupInput child must declare a value');

                return React.cloneElement(button, {
                    active: this.renderValue == value,
                    minimal: withDefault(minimal, false),
                    onClick: () => this.noteValueChange(value)
                });
            });

        return buttonGroup({
            items: buttons,
            ...rest,
            ...this.getLayoutProps(),
            className: this.getClassName()
        });
    }

}

export const buttonGroupInput = elemFactory(ButtonGroupInput);