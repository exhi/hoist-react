/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */

import {Aggregator} from './Aggregator';

export class SingleAggregator extends Aggregator {

    aggregate(rows, fieldName) {
        return rows.length === 1 ? rows[0].data[fieldName] : null;
    }
}
