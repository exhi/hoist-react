/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent} from 'hoist/core';
import {baseCol, boolCheckCol} from 'hoist/columns/Core';
import {grid, GridModel} from 'hoist/grid';
import {UrlStore} from 'hoist/data';

import {usernameCol} from '../../columns/Columns';

@hoistComponent()
export class UserPanel extends Component {

    gridModel = new GridModel({
        store: new UrlStore({
            url: 'userAdmin',
            fields: ['username', 'email', 'displayName', 'active', 'roles']
        }),
        columns: [
            usernameCol({width: 175}),
            baseCol({field: 'email', width: 175}),
            baseCol({field: 'displayName', width: 150}),
            boolCheckCol({field: 'active', width: 75}),
            baseCol({field: 'roles'})
        ]
    });

    render() {
        return grid({model: this.gridModel});
    }

    async loadAsync() {
        return this.gridModel.store.loadAsync();
    }
}
