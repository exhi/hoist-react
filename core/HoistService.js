/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {defaultMethods, markClass} from '@xh/hoist/utils/js';

import {EventSupport, ReactiveSupport, XhIdSupport, ManagedSupport} from './mixins';

/**
 * Core decorator for Services in Hoist.
 *
 * All services Hoist applications should typically be decorated with this function.
 * Adds support for managed events, mobx reactivity, and lifecycle initialization.
 */
export function HoistService(C) {

    markClass(C, 'isHoistService');

    C = ManagedSupport(C);
    C = EventSupport(C);
    C = ReactiveSupport(C);
    C = XhIdSupport(C);

    defaultMethods(C, {
        /**
         * Called by framework or application to initialize before application startup.
         * Throwing an exception from this method will typically block startup.
         * Service writers should take care to stifle and manage all non-fatal exceptions.
         */
        async initAsync() {}
    });

    return C;
}