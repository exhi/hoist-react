/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent} from 'hoist/core';
import {grid} from 'hoist/cmp/grid';
import {panel, filler} from 'hoist/cmp/layout';
import {toolbar} from 'hoist/cmp/toolbar';
import {refreshButton} from 'hoist/cmp/button';
import {storeCountLabel, storeFilterField} from 'hoist/cmp/store';

import {UserModel} from './UserModel';

@HoistComponent()
export class UserPanel extends Component {

    localModel = new UserModel();

    render() {
        return panel({
            tbar: this.renderToolbar(),
            item: grid({
                model: this.model.gridModel,
                agOptions: {
                    rowSelection: 'single'
                }
            })
        });
    }

    renderToolbar() {
        const model = this.model,
            {store} = model.gridModel;
        return toolbar(
            refreshButton({model}),
            filler(),
            storeCountLabel({
                store,
                unit: 'user'
            }),
            storeFilterField({
                store,
                fields: ['displayName', 'roles']
            })
        );
    }

    async loadAsync() {
        return this.model.loadAsync();
    }
}
