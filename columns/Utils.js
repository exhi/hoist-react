/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {defaults} from 'lodash';

const globalVals = {};

/**
 * Create a factory for use in a file to create multiple
 * column factory's with a shared set of defaults.

 * @param fileVals, defaults for file
 * @return Function to create specific column factory
 */
export function fileColFactory(fileVals = {}) {
    return function(colVals = {}) {
        return function(instanceVals = {}) {
            if (instanceVals.fixedWidth) {
                instanceVals.width = instanceVals.fixedWidth;
                instanceVals.maxWidth = instanceVals.fixedWidth;
                instanceVals.minWidth = instanceVals.fixedWidth;
            }
            // Do additional pre-processing here
            return defaults(instanceVals, colVals, fileVals, globalVals);
            // Do additional post-processing here
        };
    };
}