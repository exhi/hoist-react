/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {HoistInput} from '@xh/hoist/cmp/input/HoistInput';
import {div} from '@xh/hoist/cmp/layout';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import PT from 'prop-types';

import './Label.scss';

/**
 * A simple label for a form.
 */
@HoistComponent
export class Label extends HoistInput {

    static propTypes = {
        ...HoistInput.propTypes,

        children: PT.node
    };

    baseClassName = 'xh-input-label';

    render() {
        const {children, style, width} = this.props;
        return div({
            className: this.getClassName(),
            style: {...style, whiteSpace: 'nowrap', width},
            items: children
        });
    }
}
export const label = elemFactory(Label);
