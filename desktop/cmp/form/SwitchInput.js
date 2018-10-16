/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {switchControl} from '@xh/hoist/kit/blueprint';
import {computed} from '@xh/hoist/mobx';

import {HoistInput} from '@xh/hoist/cmp/form';

/**
 * Switch Input.
 * Note that that component does not handle null values. For nullable fields, use a Select.
 */
@HoistComponent
export class SwitchInput extends HoistInput {

    static propTypes = {
        ...HoistInput.propTypes,
        value: PT.bool
    };

    static defaultProps = {
        commitOnChange: true,
        inline: true
    };

    baseClassName = 'xh-switch-input';

    @computed
    get readOnlyValue() {
        return this.renderValue ? 'On' : 'Off';
    }

    render() {
        return switchControl({
            className: this.getClassName(),
            checked: !!this.renderValue,
            onChange: this.onChange,
            onBlur: this.onBlur,
            onFocus: this.onFocus,
            ...this.getDelegateProps()
        });
    }

    onChange = (e) => {
        this.noteValueChange(e.target.checked);
    }

    onBlur = () => {
        this.noteBlurred();
    }

    onFocus = () => {
        this.noteFocused();
    }

}
export const switchInput = elemFactory(SwitchInput);
