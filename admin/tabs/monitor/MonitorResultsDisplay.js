/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, hoistComponent} from 'hoist/core';
import {toJS} from 'hoist/mobx';
import {tile} from './Tile';

@hoistComponent()
class MonitorResultsDisplay extends Component {
    render() {
        const {results} = this.props.model;

        return (
            toJS(results).map((check, idx) => tile({
                key: `tile-${idx}`,
                check
            }))
        );
    }
}

export const monitorResultsDisplay = elemFactory(MonitorResultsDisplay);