/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {StoreFilter} from '../../StoreFilter';

// Todo: Do we still need this?
export class NoMatchFilter extends StoreFilter {

    constructor(record) {
        super({fn: () => false});
    }
}