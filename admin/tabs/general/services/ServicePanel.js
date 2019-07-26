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
import {button, exportButton} from '@xh/hoist/desktop/cmp/button';
import {storeFilterField} from '@xh/hoist/desktop/cmp/store';
import {Icon} from '@xh/hoist/icon';
import {ServiceModel} from './ServiceModel';

@HoistComponent
export class ServicePanel extends Component {
    
    model = new ServiceModel();

    render() {
        const {model} = this;

        return panel({
            mask: model.loadModel,
            tbar: this.renderToolbar(),
            item: grid({
                model: model.gridModel,
                hideHeaders: true,
                agOptions: {
                    groupRowInnerRenderer: (params) => params.value + ' Services'
                }
            })
        });
    }

    renderToolbar() {
        const {model} = this,
            {gridModel} = model;
        return [
            button({
                icon: Icon.reset(),
                text: 'Clear Selected',
                intent: 'danger',
                onClick: () => model.clearCaches(),
                disabled: gridModel.selModel.isEmpty
            }),
            filler(),
            gridCountLabel({gridModel, unit: 'service'}),
            storeFilterField({gridModel}),
            exportButton({gridModel})
        ];
    }
}