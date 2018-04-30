/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {label} from 'hoist/cmp';
import {singularize, pluralize} from 'hoist/utils/JsUtils';

/**
 * A Component that can bind to any store, provides a label for the records count
 */
@hoistComponent()
class StoreCountLabel extends Component {

    defaultUnit = 'record';

    constructor(props) {
        super(props);
        const unit = props.unit || this.defaultUnit;
        this.oneUnit = singularize(unit);
        this.manyUnits = pluralize(unit);
    }

    render() {
        const store = this.props.store,
            count = store.count,
            unitLabel = count === 1 ? this.oneUnit : this.manyUnits;
        return label(`${count} ${unitLabel}`);
    }
}

export const storeCountLabel = elemFactory(StoreCountLabel);