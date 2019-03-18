/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistComponent, useClassName} from '@xh/hoist/core';

import {box} from './Box';

/**
 * A container for the top level of the application.
 * Will stretch to encompass the entire browser.
 */
export const [Viewport, viewport] = hoistComponent(props => {
    return box({
        ...props,
        top: 0,
        left: 0,
        position: 'fixed',
        width: '100%',
        height: '100%',
        className: useClassName('xh-viewport', props)
    });
});
