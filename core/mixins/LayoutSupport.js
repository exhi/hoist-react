/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {applyMixin} from '@xh/hoist/utils/js';
import {getLayoutProps, getNonLayoutProps} from '@xh/hoist/utils/react';

/**
 * This mixin provides support for flexbox related styles that are set as top-level properties
 * on a component.
 *
 * The following properties will be supported:
 *     margin, marginTop, marginRight, marginBottom, marginLeft,
 *     padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
 *     height, minHeight, maxHeight, width, minWidth, maxWidth,
 *     flex, flexBasis, flexDirection, flexGrow, flexShrink, flexWrap,
 *     alignItems, alignSelf, alignContent, justifyContent,
 *     overflow, overflowX, overflowY,
 *     top, left, position, display
 *
 * This mixin also promises that the Component will respect and respond to these properties.
 * Components will typically delegate this responsibility to a child component that also
 * implements LayoutSupport. `Box` is typically the Component that is ultimately rendered
 * and will handle this by outputting a div with appropriate styles.
 */
export function LayoutSupport(C) {
    return applyMixin(C, {
        name: 'LayoutSupport',

        provides: {

            getLayoutProps() {
                return getLayoutProps(this.props);
            },

            getNonLayoutProps() {
                return getNonLayoutProps(this.props);
            }
        }
    });
}
