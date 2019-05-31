/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Aggregator} from '@xh/hoist/data/cube/aggregate/Aggregator';

export class SumAggregator extends Aggregator {

    aggregate(records, fieldName) {
        return records.reduce((ret, it) => {
            const val = it.get(fieldName);
            if (val != null) ret += val;
            return ret;
        }, null);
    }
}