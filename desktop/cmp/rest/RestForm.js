/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {dialog, dialogBody} from '@xh/hoist/kit/blueprint';
import {HoistComponent, elemFactory, XH} from '@xh/hoist/core';
import {mask} from '@xh/hoist/desktop/cmp/mask';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {filler, vframe} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

import {restControl} from './RestControl';
import './RestForm.scss';
import {recordActionButton} from 'desktop/cmp/record/RecordActionButton';

@HoistComponent
export class RestForm extends Component {

    baseClassName = 'xh-rest-form';

    render() {
        const {record, isAdd} = this.model;
        if (!record) return null;

        return dialog({
            title: isAdd ? 'Add Record' : 'Edit Record',
            icon: isAdd ? Icon.add() : Icon.edit(),
            className: this.getClassName(),
            isOpen: true,
            isCloseButtonShown: false,
            items: this.getDialogItems()
        });
    }

    //------------------------
    // Implementation
    //------------------------
    getDialogItems() {
        const model = this.model;
        return [
            dialogBody(this.getForm()),
            toolbar(this.getButtons()),
            mask({model: model.loadModel, spinner: true})
        ];
    }
    
    getForm() {
        return vframe(
            this.model.controlModels.map((model, idx) => {
                return idx == 0 ? restControl({model, autoFocus: true}) : restControl({model});
            })
        );
    }

    getButtons() {
        const {isValid, isWritable, isDirty, isAdd, formDeleteAction} = this.model;

        return [
            recordActionButton({
                action: formDeleteAction,
                context: this.model.parent,

                omit: !formDeleteAction
            }),
            button({
                text: 'Delete',
                icon: Icon.delete(),
                intent: 'danger',
                onClick: this.onDeleteClick,
                omit: !canDelete || isAdd
            }),
            filler(),
            button({
                text: 'Cancel',
                onClick: this.onCloseClick
            }),
            button({
                text: 'Save',
                icon: Icon.check(),
                intent: 'success',
                disabled: !isValid  || !isDirty,
                onClick: this.onSaveClick,
                omit: !isWritable
            })
        ];
    }

    onCloseClick = () => {
        this.model.close();
    }

    onDeleteClick = () => {
        const model = this.model,
            warning = model.actionWarning.del;

        if (warning) {
            XH.confirm({
                message: warning,
                title: 'Warning',
                icon: Icon.warning({size: 'lg'}),
                onConfirm: () => model.deleteRecord()
            });
        } else {
            model.deleteRecord();
        }
    }

    onSaveClick = () => {
        const model = this.model,
            isAdd = model.isAdd,
            warning = model.actionWarning[isAdd ? 'add' : 'edit'];

        if (warning) {
            XH.confirm({
                message: warning,
                title: 'Warning',
                icon: Icon.warning({size: 'lg'}),
                onConfirm: () => model.saveRecord()
            });
        } else {
            model.saveRecord();
        }
    }
}
export const restForm = elemFactory(RestForm);
