/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {hbox} from 'hoist/layout';
import {button} from 'hoist/kit/blueprint';
import {Glyph, glyph} from 'hoist/utils/Glyph';

@hoistComponent()
export class RestGridToolbar extends Component {

    render() {
        const model = this.model,
            singleRecord = model.selection.singleRecord,
            actionEnabled = model.actionEnabled;

        return hbox({
            cls: 'xh-tbar',
            itemSpec: {
                factory: button,
                cls: 'xh-mr'
            },
            items: [
                {
                    text: 'Add',
                    icon: glyph(Glyph.ADD),
                    intent: 'success',
                    onClick: this.onAddClick,
                    omit: !actionEnabled.add
                },
                {
                    text: 'Edit',
                    icon: glyph(Glyph.EDIT),
                    onClick: this.onEditClick,
                    disabled: !singleRecord,
                    omit: !actionEnabled.edit
                },
                {
                    text: 'Delete',
                    icon: glyph(Glyph.DELETE),
                    intent: 'danger',
                    onClick: this.onDeleteClick,
                    disabled: !singleRecord,
                    omit: !actionEnabled.del
                }
            ]
        });
    }

    //-----------------------------
    // Implementation
    //-----------------------------
    onAddClick = () => {
        this.model.addRecord();
    }

    onEditClick = () => {
        this.model.editSelection();
    }

    onDeleteClick = () => {
        const model = this.model,
            warning = model.actionWarning.del;
        if (warning) {
            model.messageModel.alert({
                message: warning,
                onConfirm: () => model.deleteSelection()
            });
        } else {
            model.deleteSelection();
        }
    }
}
export const restGridToolbar = elemFactory(RestGridToolbar);
