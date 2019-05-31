/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {merge, castArray} from 'lodash';
import {hoistComponent, useLayoutProps} from '@xh/hoist/core';
import {getClassName} from '@xh/hoist/utils/react';
import {div} from './Tags';


/**
 * A Component that supports flexbox-based layout of its contents.
 *
 * Box is the component that provides the core implementation of the LayoutSupport mixin.
 * It renders a div and merges all layout props to that div's `style` property.
 *
 * VBox and HBox variants support internal vertical (column) and horizontal (row) flex layouts.
 */
export const [Box, box] = hoistComponent(function Box(props, ref) {
    let [layoutProps, {children, ...restProps}] = useLayoutProps(props);

    restProps = merge(
        {style: {display: 'flex', overflow: 'hidden', position: 'relative'}},
        {style: layoutProps},
        restProps
    );

    return div({
        ref,
        ...restProps,
        items: castArray(children)
    });
});

export const [VBox, vbox] = hoistComponent(function VBox(props, ref) {
    return box({
        ref,
        ...props,
        flexDirection: 'column',
        className: getClassName('xh-vbox', props)
    });
});

export const [HBox, hbox] = hoistComponent(function HBox(props, ref) {
    return box({
        ref,
        ...props,
        flexDirection: 'row',
        className: getClassName('xh-hbox', props)
    });
});