/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {grid} from 'hoist/grid';
import {vframe, hbox, filler, hspacer} from 'hoist/layout';
import {button} from 'hoist/kit/blueprint';
import {textField, dayField, label} from 'hoist/cmp';
import {Icon} from 'hoist/icon';

@hoistComponent()
export class ActivityGrid extends Component {

    render() {
        return vframe(
            this.renderToolbar(),
            grid({model: this.model.gridModel})
        );
    }

    renderToolbar() {
        const model = this.model;
        return hbox({
            cls: 'xh-tbar',
            flex: 'none',
            padding: 3,
            alignItems: 'center',
            items: [
                hspacer(4),
                dayField({model, field: 'startDate', onCommit: this.onDateCommit, popoverPosition: 'bottom'}),
                hspacer(8),
                Icon.angleRight(),
                hspacer(8),
                dayField({model, field: 'endDate', onCommit: this.onDateCommit, popoverPosition: 'bottom'}),
                hspacer(8),
                button({icon: Icon.caretLeft(), onClick: this.onDateGoBackClick}),
                button({icon: Icon.caretRight(), onClick: this.onDateGoForwardClick}),
                button({icon: Icon.arrowToRight(), onClick: this.onGoToCurrentDateClick}),
                hspacer(8),
                '|',
                hspacer(8),
                textField({model, field: 'username', placeholder: 'User...'}),
                hspacer(10),
                textField({model, field: 'msg', placeholder: 'Msg...'}),
                hspacer(10),
                textField({model, field: 'category', placeholder: 'Category...'}),
                hspacer(10),
                textField({model, field: 'device', placeholder: 'Device...'}),
                hspacer(10),
                textField({model, field: 'browser', placeholder: 'Browser...'}),
                hspacer(8),
                '|',
                hspacer(8),
                button({icon: Icon.sync(), onClick: this.onSubmitClick}),
                filler(),
                this.renderLogCount(),
                hspacer(8),
                button({icon: Icon.download(), onClick: this.onExportClick})
            ]
        });
    }

    //-----------------------------
    // Implementation
    //-----------------------------
    onDateGoBackClick = () => {
        this.model.adjustDates('subtract');
    }

    onDateGoForwardClick = () => {
        this.model.adjustDates('add');
    }

    onGoToCurrentDateClick = () => {
        this.model.adjustDates('subtract', true);
    }

    onDateCommit = () => {
        this.model.loadAsync();
    }

    onSubmitClick = () => {
        this.model.loadAsync();
    }

    onExportClick = () => {
        this.model.exportGrid();
    }

    renderLogCount() {
        const store = this.model.gridModel.store;
        return label(store.records.length + ' track logs');
    }

}
export const activityGrid = elemFactory(ActivityGrid);
