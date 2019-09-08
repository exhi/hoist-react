/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {useContext, useEffect} from 'react';
import {hoistCmpAndFactory, providedAndPublished} from '@xh/hoist/core';
import {ModelLookupContext} from '../impl/ModelLookup';

/**
 * Establishes an area of the application with an independent RefreshContextModel.
 *
 * The model established by this view will be refreshed by its parent context but may also be refreshed
 * independently.
 *
 * @see RefreshContextModel
 */
export const [RefreshContextView, refreshContextView] = hoistCmpAndFactory({
    displayName: 'RefreshContextView',
    model: providedAndPublished('RefreshContextModel'),

    render(props) {
        const {model} = props,
            lookup = useContext(ModelLookupContext),
            parentModel = lookup && lookup.parent ? lookup.parent.lookupModel('RefreshContextModel') : null;

        useEffect(() => {
            if (model && parentModel) {
                parentModel.register(model);
                return () => parentModel.unregister(model);
            }
        });

        return props.children;
    }
});