/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {button} from '@xh/hoist/kit/blueprint';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {grid} from '@xh/hoist/cmp/grid';
import {filler, panel} from '@xh/hoist/cmp/layout';
import {textField, dayField} from '@xh/hoist/cmp/form';
import {toolbar, toolbarSep} from '@xh/hoist/cmp/toolbar';
import {exportButton, refreshButton} from '@xh/hoist/cmp/button';
import {storeCountLabel} from '@xh/hoist/cmp/store';
import {Icon} from '@xh/hoist/icon';

import {activityDetail} from './ActivityDetail';

@HoistComponent()
export class ActivityGrid extends Component {

    render() {
        const {model} = this;
        return panel({
            tbar: this.renderToolbar(),
            items: [
                grid({
                    model: model.gridModel,
                    flex: 'auto',
                    agOptions: {
                        rowSelection: 'single',
                        onRowDoubleClicked: this.onRowDoubleClicked
                    }
                }),
                activityDetail({model})
            ]
        });
    }

    renderToolbar() {
        const model = this.model;
        return toolbar(
            this.dayField({field: 'startDate'}),
            Icon.angleRight(),
            this.dayField({field: 'endDate'}),
            button({
                icon: Icon.caretLeft(),
                onClick: this.onDateGoBackClick
            }),
            button({
                icon: Icon.caretRight(),
                onClick: this.onDateGoForwardClick,
                cls: 'xh-no-pad'
            }),
            button({
                icon: Icon.arrowToRight(),
                onClick: this.onGoToCurrentDateClick,
                cls: 'xh-no-pad'
            }),
            toolbarSep(),
            this.textField({field: 'username', placeholder: 'User...'}),
            this.textField({field: 'msg', placeholder: 'Msg...'}),
            this.textField({field: 'category', placeholder: 'Category...'}),
            this.textField({field: 'device', placeholder: 'Device...'}),
            this.textField({field: 'browser', placeholder: 'Browser...'}),
            refreshButton({model}),
            filler(),
            storeCountLabel({
                store: model.gridModel.store,
                unit: 'log'
            }),
            exportButton({model})
        );
    }
    
    //-----------------------------
    // Implementation
    //-----------------------------
    dayField(args) {
        return dayField({
            model: this.model,
            popoverPosition: 'bottom',
            width: 100,
            onCommit: this.onCommit,
            ...args
        });
    }

    textField(args) {
        return textField({
            model: this.model,
            width: 140,
            onCommit: this.onCommit,
            ...args
        });
    }

    onCommit = () => {
        this.model.loadAsync();
    }

    onDateGoBackClick = () => {
        this.model.adjustDates('subtract');
    }

    onDateGoForwardClick = () => {
        this.model.adjustDates('add');
    }

    onGoToCurrentDateClick = () => {
        this.model.adjustDates('subtract', true);
    }

    onRowDoubleClicked = (e) => {
        this.model.openDetail(e.data);
    }
}
export const activityGrid = elemFactory(ActivityGrid);