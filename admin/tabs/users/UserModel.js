/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {UrlStore} from 'hoist/data';
import {GridModel} from 'hoist/grid';

import {baseCol, boolCheckCol} from 'hoist/columns/Core';
import {usernameCol} from '../../columns/Columns';

export class UserModel {

    store = new UrlStore({
        url: 'userAdmin',
        fields: ['username', 'email', 'displayName', 'active', 'roles']
    });

    gridModel = new GridModel({
        store: this.store,
        columns: [
            usernameCol({fixedWidth: 175}),
            baseCol({field: 'email', fixedWidth: 175}),
            baseCol({field: 'displayName', fixedWidth: 150}),
            boolCheckCol({field: 'active', fixedWidth: 75}),
            baseCol({field: 'roles', minWidth: 130, flex: 1})
        ]
    });

    async loadAsync() {
        return this.store.loadAsync();
    }
}
