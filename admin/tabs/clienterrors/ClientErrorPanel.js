/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {button} from 'hoist/kit/blueprint';
import {HoistComponent} from 'hoist/core';
import {filler} from 'hoist/cmp/layout';
import {panel} from 'hoist/cmp/panel';
import {grid} from 'hoist/cmp/grid';
import {textField, dayField} from 'hoist/cmp/form';
import {toolbar, toolbarSep} from 'hoist/cmp/toolbar';
import {exportButton, refreshButton} from 'hoist/cmp/button';
import {storeCountLabel} from 'hoist/cmp/store';
import {Icon} from 'hoist/icon';

import {ClientErrorModel} from './ClientErrorModel';
import {clientErrorDetail} from './ClientErrorDetail';

@HoistComponent()
export class ClientErrorPanel extends Component {

    localModel = new ClientErrorModel();

    render() {
        const {model} = this;
        return panel({
            tbar: this.renderToolbar(),
            items: [
                grid({
                    model: model.gridModel,
                    agOptions: {
                        rowSelection: 'single',
                        onRowDoubleClicked: this.onRowDoubleClicked
                    }
                }),
                clientErrorDetail({model})
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
            this.textField({field: 'error', placeholder: 'Error...'}),
            refreshButton({model}),
            filler(),
            storeCountLabel({
                store: model.gridModel.store,
                unit: 'client error'
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
            onCommit: this.onCommit,
            popoverPosition: 'bottom',
            width: 100,
            ...args
        });
    }

    textField(args) {
        return textField({
            model: this.model,
            onCommit: this.onCommit,
            width: 150,
            ...args
        });
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

    onCommit = () => {
        this.loadAsync();
    }

    onRowDoubleClicked = (e) => {
        this.model.openDetail(e.data);
    }

    async loadAsync() {
        return this.model.loadAsync();
    }
}