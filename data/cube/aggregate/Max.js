/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

//= require Aggregator.js

Ext.define('XH.cube.aggregate.Max', {
    extend: XH.cube.aggregate.Aggregator,
    singleton: true,

    aggregate(records, fieldName) {
        return records.reduce((ret, it) => {
            const val = it.get(fieldName);
            if (val != null  && (ret == null || val > ret)) {
                ret = val;
            }
            return ret;
        }, null);
    },

    replace(records, currAgg, update) {
        if (update.newVal >= currAgg) return update.newVal;
        if (update.oldVal >= currAgg) return this.aggregate(records, update.field.name);

        return currAgg;
    }
});