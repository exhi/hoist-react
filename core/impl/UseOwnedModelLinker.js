/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {useContext, useEffect} from 'react';
import {RefreshContext} from '../refresh/RefreshContext';

/**
 * @private
 *
 * Integrate a HoistModel owned by a component into the component's lifecycle,
 * enabling support for the LoadSupport lifecycle and destruction.
 *
 * Null op, if model is null.
 */
export function useOwnedModelLinker(model) {
    const context = useContext(RefreshContext);
    useEffect(() => {
        if (model && model.isLoadSupport) {
            model.loadAsync();
            if (context) {
                context.register(model);
                return () => context.unregister(model);
            }
        }
    }, [model, context]);

    useEffect(() => {
        if (model && model.destroy) return () => model.destroy();
    }, [model]);
}