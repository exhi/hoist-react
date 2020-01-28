/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {Aggregator} from './Aggregator';

export class SumStrictAggregator extends Aggregator {

    aggregate(records, fieldName) {
        if (!records.length || records.some(it => it.data[fieldName] == null)) return null;

        return records.reduce((ret, it) => {
            ret += it.data[fieldName];
            return ret;
        }, 0);
    }
}