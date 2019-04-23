/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

Ext.define('XH.cube.aggregate.SumStrict', {
    extend: XH.cube.aggregate.Aggregator,
    singleton: true,

    aggregate(records, fieldName) {
        if (!records.length || records.some(it => it.get(fieldName) == null)) return null;

        return records.reduce((ret, it) => {
            ret += it.get(fieldName);
            return ret;
        }, 0);
    },

    replace(records, currAgg, update) {
        const {oldVal, newVal} = update;
        if (currAgg == null || oldVal == null || newVal == null) {
            return this.callParent([records, currAgg, update]);
        }
        return currAgg - oldVal + newVal;
    }
});