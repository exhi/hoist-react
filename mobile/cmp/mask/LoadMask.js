/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {div, vbox, vspacer, box} from '@xh/hoist/layout';
import {progressCircular} from '@xh/hoist/mobile/onsen';

import './Mask.scss';

/**
 * Mask with spinner. The mask can be explicitly shown or reactively bound to a PromiseModel.
 */
@HoistComponent()
export class LoadMask extends Component {

    static propTypes = {
        isDisplayed: PT.bool,
        /** PromiseModel instance. If provided, loadMask will show while promise is pending */
        model: PT.object,
        /** Text to be displayed under the loading spinner image */
        text: PT.string
    };

    render() {
        const {isDisplayed, model, text} = this.props;
        if (!(isDisplayed || (model && model.isPending))) return null;

        return div({
            cls: 'xh-mask',
            item: vbox({
                cls: 'xh-mask-body',
                items: [
                    progressCircular({indeterminate: true}),
                    vspacer(10),
                    text ? box({cls: 'xh-mask-text', item: text}) : null
                ]
            })
        });
    }

}

export const loadMask = elemFactory(LoadMask);