/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent} from '@xh/hoist/core';
import {grid, gridCountLabel} from '@xh/hoist/cmp/grid';
import {filler} from '@xh/hoist/cmp/layout';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {toolbarSep} from '@xh/hoist/desktop/cmp/toolbar';
import {storeFilterField} from '@xh/hoist/desktop/cmp/store';
import {switchInput} from '@xh/hoist/desktop/cmp/input';
import {exportButton} from '@xh/hoist/desktop/cmp/button';


import {UserModel} from './UserModel';

@HoistComponent
export class UserPanel extends Component {

    model = new UserModel();

    render() {
        const {model} = this;
        return panel({
            mask: model.loadModel,
            tbar: this.renderToolbar(),
            item: grid({model: model.gridModel})
        });
    }

    renderToolbar() {
        const {model} = this,
            {gridModel} = model;

        return [
            switchInput({
                model,
                bind: 'activeOnly',
                label: 'Active only'
            }),
            toolbarSep(),
            switchInput({
                model,
                bind: 'withRolesOnly',
                label: 'With roles only'
            }),
            filler(),
            gridCountLabel({gridModel, unit: 'user'}),
            storeFilterField({gridModel}),
            exportButton({gridModel})
        ];
    }
}
