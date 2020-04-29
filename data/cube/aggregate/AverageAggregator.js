/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {Aggregator} from '@xh/hoist/data/cube/aggregate/Aggregator';

export class AverageAggregator extends Aggregator {

    aggregate(rows, fieldName) {
        let total = null,
            count = 0;

        for (const row of rows) {
            const val = row.data[fieldName];
            if (val != null) {
                total += val;
                count++;
            }
        }

        return total != null ? total / count : null;
    }
}