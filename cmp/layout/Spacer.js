/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistCmpAndFactory} from '@xh/hoist/core';
import {getClassName} from '@xh/hoist/utils/react';
import {box} from './Box';

/**
 * A component for inserting a fixed-sized spacer along the main axis of its parent container.
 * Convenience ElemFactories hspacer() and vspacer() each take a pixel size directly.
 */
export const [Spacer, spacer] = hoistCmpAndFactory({
    displayName: 'Spacer',

    render(props) {
        return box({
            ...props,
            flex: 'none',
            className: getClassName('xh-spacer', props)
        });
    }
});

/**
 * A component that stretches to soak up space along the main axis of its parent container.
 */
export const [Filler, filler] = hoistCmpAndFactory({
    displayName: 'Filler',

    render(props) {
        return box({
            ...props,
            flex: 'auto',
            className: getClassName('xh-filler', props)
        });
    }
});


//--------------------------------
// Convenience Factories
//--------------------------------
export function hspacer(width)  {return spacer({width})}
export function vspacer(height) {return spacer({height})}