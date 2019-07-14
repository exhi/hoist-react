/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {grid} from '@xh/hoist/cmp/grid';
import {filler} from '@xh/hoist/cmp/layout';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {dateInput, textInput} from '@xh/hoist/desktop/cmp/input';
import {toolbarSep} from '@xh/hoist/desktop/cmp/toolbar';
import {button, exportButton, refreshButton} from '@xh/hoist/desktop/cmp/button';
import {storeCountLabel} from '@xh/hoist/cmp/store';
import {Icon} from '@xh/hoist/icon';

import {ActivityGridModel} from './ActivityGridModel';
import {activityDetail} from './ActivityDetail';

@HoistComponent
export class ActivityGrid extends Component {

    model = new ActivityGridModel();

    render() {
        const {model} = this;
        return panel({
            mask: model.loadModel,
            tbar: this.renderToolbar(),
            items: [
                grid({
                    model: model.gridModel,
                    onRowDoubleClicked: (e) => model.openDetail(e.data)
                }),
                activityDetail({model})
            ]
        });
    }

    renderToolbar() {
        const {model} = this;
        return [
            button({
                icon: Icon.angleLeft(),
                onClick: () => model.adjustDates('subtract')
            }),
            this.dateInput({bind: 'startDate'}),
            Icon.caretRight(),
            this.dateInput({bind: 'endDate'}),
            button({
                icon: Icon.angleRight(),
                onClick: () => model.adjustDates('add')
            }),
            button({
                icon: Icon.angleDoubleRight(),
                onClick: () => model.adjustDates('subtract', true)
            }),
            toolbarSep(),
            this.textInput({bind: 'username', placeholder: 'Username', enableClear: true}),
            this.textInput({bind: 'msg', placeholder: 'Message', enableClear: true}),
            this.textInput({bind: 'category', placeholder: 'Category', enableClear: true}),
            this.textInput({bind: 'device', placeholder: 'Device', enableClear: true}),
            this.textInput({bind: 'browser', placeholder: 'Browser', enableClear: true}),
            refreshButton({model}),
            filler(),
            storeCountLabel({gridModel: model.gridModel, unit: 'log'}),
            exportButton({gridModel: model.gridModel})
        ];
    }
    
    //-----------------------------
    // Implementation
    //-----------------------------
    dateInput(args) {
        return dateInput({
            model: this.model,
            popoverPosition: 'bottom',
            width: 120,
            ...args
        });
    }

    textInput(args) {
        return textInput({
            model: this.model,
            width: 140,
            ...args
        });
    }
}
export const activityGrid = elemFactory(ActivityGrid);