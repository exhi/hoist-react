/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {useOwnedModelLinker} from '@xh/hoist/core/impl';
import {useState, useContext} from 'react';
import {ModelLookupContext} from '../impl/ModelLookup';

/**
 * Hook to allow a component to access a HoistModel provided in context by an ancestor component.
 *
 * @param {(Class|string)} [selector] - class or name of mixin applied to class of
 *      model to be returned.  If not provided the 'closest' inherited model will be returned.
 * @returns model or null if no matching model found.
 */
export function useContextModel(selector) {
    const modelLookup = useContext(ModelLookupContext),
        [ret] = useState(() => {
            if (modelLookup) {
                return modelLookup.lookupModel(selector);
            }
            return null;
        });

    return ret;
}

/**
 * Create a new model that will be maintained for lifetime of component and destroyed
 * when component is unmounted, or specified dependencies have changed.
 *
 * @param {(Class|function)} spec - class of HoistModel to create, or a function to call to generate one.
 * @param {Object[]} [dependencies] - array of values to be compared across renders.  If changed, the
 *      model will be destroyed and re-created.  This argument has the same semantics as
 *      the 'dependencies' argument in React.useEffect(), with the important exception that it
 *      defaults to [] rather than null, so that LocalModel's will be preserved by default.
 */
export function useLocalModel(spec, dependencies = []) {
    const [state] = useState({model: null, dependencies: null});
    if (!state.model || !depsEqual(state.dependencies, dependencies)) {
        if (!spec) {
            state.model = null;
        } else {
            state.model = spec.isHoistModel ? new spec() : spec.call();
        }
        state.dependencies = dependencies;
    }
    useOwnedModelLinker(state.model);
    return state.model;
}


//------------------------------
// Implementation
//------------------------------

// Adapted From React useEffect(), 10/2019 source
function depsEqual(prevDeps, nextDeps) {
    if (!nextDeps || !prevDeps || nextDeps.length !== prevDeps.length) {
        return false;
    }
    for (let i = 0; i < prevDeps.length; i++) {
        if (Object.is(nextDeps[i], prevDeps[i])) continue;
        return false;
    }
    return true;
}