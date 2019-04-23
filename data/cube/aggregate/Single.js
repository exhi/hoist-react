/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Aggregator} from '@xh/hoist/data/cube/aggregate/Aggregator';

export class Single extends Aggregator {

    aggregate(records, fieldName) {
        return records.length == 1 ? records.get(fieldName) : null;
    }
}