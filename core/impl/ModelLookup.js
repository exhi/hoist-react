/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {createContext} from 'react';
import {isNil} from 'lodash';
import {elemFactory} from '@xh/hoist/core/index';

/**
 * @private
 *
 * Support for making models available to components via React context.
 *
 * Not created directly by applications.  Components that need to *provide* models to
 * their descendants should use the WithModel component, which will create an instance
 * of this class.
 */
export class ModelLookup {
    model;
    parent;

    /**
     * @param model -  model provided by this object.
     * @param {ModelLookup} parent - parent instance of this class.
     */
    constructor(model, parent) {
        this.model = model;
        this.parent = parent;
    }

    /**
     * Lookup a model in the object, or one of its parents.
     *
     * @param [modelClass] - class of model to be returned.  If not provided the 'closest'
     *      inherited model will be returned.
     * @returns {*} model or null if no matching model found.
     */
    lookupModel(modelClass) {
        const {model, parent} = this;

        if (isNil(modelClass) || model instanceof modelClass) {
            return model;
        }

        return parent ? parent.lookupModel(modelClass) : null;
    }
}

/**
 * @private
 *
 * Context used to publish a ModelLookup
 */
export const ModelLookupContext = createContext(null);

export const modelLookupContextProvider = elemFactory(ModelLookupContext.Provider);
