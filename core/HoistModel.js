/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {EventSupport, ReactiveSupport, XhIdSupport} from './mixins';
import {defaultMethods, markClass} from '@xh/hoist/utils/js';


/**
 * Core decorator for State Models in Hoist.
 *
 * All State models in Hoist applications should typically be decorated with this function.
 * Adds support for managed events and mobx reactivity.
 */
export function HoistModel(C) {
    markClass(C, 'isHoistModel');

    C = EventSupport(C);
    C = ReactiveSupport(C);
    C = XhIdSupport(C);
    
    defaultMethods(C, {

        /**
         * Load this model
         *
         * @param {boolean} [isAutoRefresh] - true if this load was triggered by a programmatic refresh process,
         *      rather than a user action.
         */
        loadAsync({isAutoRefresh = false} = {}) {

        },

        /**
         * Refresh this model
         *
         * This method defaults to delegating to loadAsync.  Override this method
         * if thic component has behavior that should only occur on refresh.
         *
         * @param {boolean} [isAutoRefresh] - true if this load was triggered by a programmatic refresh process,
         *      rather than a user action.
         */
        refreshAsync({isAutoRefresh = false} = {}) {
            return this.loadAsync({isAutoRefresh});
        }
    });

    return C;
}
