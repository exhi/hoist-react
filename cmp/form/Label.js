/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {PropTypes as PT} from 'prop-types';
import {hoistComponent, elemFactory} from 'hoist/core';
import {div} from 'hoist/layout';

import {HoistField} from './HoistField';

/**
 * A simple label for a form.
 */
@hoistComponent()
export class Label extends HoistField {

    static propTypes = {
        children: PT.node,
        style: PT.object,
        className: PT.string,
        width: PT.int
    };

    delegateProps = ['className'];
    
    render() {
        const {children, style, width} = this.props;
        return div({
            cls: 'pt-label pt-inline',
            style: {...style, whiteSpace: 'nowrap', width},
            items: children,
            ...this.getDelegateProps()
        });
    }
}
export const label = elemFactory(Label);