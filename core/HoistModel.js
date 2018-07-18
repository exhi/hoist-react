/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {EventSupport} from './mixins/EventSupport';
import {ReactiveSupport} from './mixins/ReactiveSupport';

/**
 * Core decorator for State Models in Hoist.
 *
 * All State models in Hoist applications should typically be decorated with this function.
 * Adds support for managed events and mobx reactivity.
 */
export function HoistModel() {

    return (C) => {
        C.isHoistModel = true;

        C = EventSupport(C);
        C = ReactiveSupport(C);
        
        return C;
    };
}
