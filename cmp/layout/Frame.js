/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {elemFactory, hoistCmp} from '@xh/hoist/core';
import {getClassName} from '@xh/hoist/utils/react';

import {box} from './Box';

/**
 * A Box class that flexes to grow and stretch within its *own* parent via flex:'auto', useful for
 * creating nested layouts.
 *
 * Like Box, Frame provides access to its internal div via a ref argument.
 *
 * VFrame and HFrame variants support internal vertical (column) and horizontal (row) flex layouts.
 */
export const Frame = hoistCmp({
    displayName: 'Frame',

    render(props, ref) {
        return box({ref, ...props, flex: 'auto'});
    }
});

export const VFrame = hoistCmp({
    displayName: 'VFrame',

    render(props, ref) {
        return box({
            ref,
            ...props,
            flex: 'auto',
            flexDirection: 'column',
            className: getClassName('xh-vframe', props)
        });
    }
});

export const HFrame = hoistCmp({
    displayName: 'HFrame',

    render(props, ref) {
        return box({
            ref,
            ...props,
            flex: 'auto',
            flexDirection: 'row',
            className: getClassName('xh-hframe', props)
        });
    }
});

export const frame = elemFactory(Frame);
export const vframe = elemFactory(VFrame);
export const hframe = elemFactory(HFrame);