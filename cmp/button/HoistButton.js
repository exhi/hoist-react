/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {button} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';

/**
 * Wrapper around Blueprint's Button component.
 * Hoist's most basic button is preconfigured with a generic click icon and title for override
 * Accepts props documented below as well as any supported by Blueprint's Button.
 *
 * Must be provided either an onClick handler *or* a model. If a model is provided, this button
 * will call onButtonClick() on the model class.
 */
@HoistComponent()
export class HoistButton extends Component {

    static propTypes = {
        icon: PT.element,
        title: PT.string,
        onClick: PT.func,
        model: PT.object
    };

    render() {
        const {icon, onClick, model, ...rest} = this.props;
        return button({
            icon: icon || Icon.click(),
            title: this.title || 'Click',
            onClick: onClick || this.onButtonClick,
            ...rest
        });
    }


    //---------------------------
    // Implementation
    //---------------------------
    onButtonClick = () => {
        this.model.onButtonClick();
    }

}
export const hoistButton = elemFactory(HoistButton);