/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {hoistCmp} from '@xh/hoist/core';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {elemFactory} from '@xh/hoist/core';
import {enhanceFaClasses} from './IconHtml';

/**
 * @private
 *
 * Internal component for a FontAwesome Icon in Hoist.
 *
 * Applications should use the factory methods on Icon instead.
 */
export const iconCmp = hoistCmp.factory({
    displayName: 'Icon',
    observer: false,
    model: false,

    render({iconName, prefix, title, className, size, ...rest}) {
        className = enhanceFaClasses(className, size);
        return fontAwesomeIcon({icon: [prefix, iconName], className, title, ...rest});
    }
});
const fontAwesomeIcon = elemFactory(FontAwesomeIcon);
