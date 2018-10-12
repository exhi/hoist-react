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
import {recordActionBar} from '@xh/hoist/desktop/cmp/record';

import {restControl} from './RestControl';

import './RestForm.scss';

@HoistComponent
export class RestForm extends Component {

    baseClassName = 'xh-rest-form';

    render() {
        const {record, isAdd, isWritable} = this.model;
        if (!record) return null;

        return dialog({
            title: isAdd ? 'Add Record' : (isWritable ? 'Edit Record' : 'View Record'),
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
        const {isWritable} = this.model;
        return vframe(
            this.model.controlModels.map((model,
                idx) => restControl({model, disabled: !isWritable, autoFocus: idx === 0}))
        );
    }

    getButtons() {
        const {isValid, isWritable, isDirty, record, actions, parent} = this.model;

        return [
            recordActionBar({
                actions,
                record,
                gridModel: parent.gridModel
            }),
            filler(),
            button({
                text: isWritable ? 'Cancel' : 'Close',
                onClick: this.onCloseClick
            }),
            button({
                text: 'Save',
                icon: Icon.check(),
                intent: 'success',
                disabled: !isValid || !isDirty,
                onClick: this.onSaveClick,
                omit: !isWritable
            })
        ];
    }

    onCloseClick = () => {
        this.model.close();
    };

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
    };
}

export const restForm = elemFactory(RestForm);
