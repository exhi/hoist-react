/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {box} from '@xh/hoist/cmp/layout';
import {Classes, overlay} from '@xh/hoist/kit/blueprint';

import './Mask.scss';

/**
 * Mask for disabled or inactive components.
 * Note: Mask is built into Panel via its masked prop.
 */
@HoistComponent()
export class Mask extends Component {

    static propTypes = {
        isDisplayed: PT.bool,
        text: PT.string
    };

    baseCls = 'xh-mask';

    render() {
        let {isDisplayed, text} = this.props;
        if (!isDisplayed) return null;

        return overlay({
            cls: this.getClassNames(Classes.OVERLAY_SCROLL_CONTAINER),
            autoFocus: false,
            isOpen: true,
            canEscapeKeyClose: false,
            usePortal: false,
            enforceFocus: false,
            item: box({
                cls: 'xh-mask-body',
                item: text ? box({cls: 'xh-mask-text', item: text}) : null
            })
        });
    }
}
export const mask = elemFactory(Mask);