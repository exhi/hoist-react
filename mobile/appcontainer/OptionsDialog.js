/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {vframe, filler} from '@xh/hoist/cmp/layout';
import {Icon} from '@xh/hoist/icon';
import {dialog} from '@xh/hoist/mobile/cmp/dialog';
import {form} from '@xh/hoist/cmp/form';
import {formField} from '@xh/hoist/mobile/cmp/form';
import {button} from '@xh/hoist/mobile/cmp/button';

/**
 * Display Options dialog
 *
 * @private
 */
@HoistComponent
export class OptionsDialog extends Component {

    render() {
        const {model} = this,
            {isOpen, formModel, hasChanges, requiresRefresh} = model;

        if (!isOpen) return null;

        return dialog({
            title: 'Options',
            icon: Icon.gear(),
            className: 'xh-options-dialog',
            isOpen: true,
            onCancel: this.onCloseClick,
            content: form({
                model: formModel,
                item: vframe(...model.options.map(it => this.renderControl(it)))
            }),
            buttons: [
                button({
                    disabled: !hasChanges,
                    text: 'Reset',
                    modifier: 'quiet',
                    onClick: this.onResetClick
                }),
                filler(),
                button({
                    text: 'Cancel',
                    modifier: 'quiet',
                    onClick: this.onCloseClick
                }),
                button({
                    disabled: !hasChanges,
                    text: 'Save',
                    icon: requiresRefresh ? Icon.refresh() : Icon.check(),
                    onClick: this.onSaveClick
                })
            ]
        });
    }

    renderControl(cfg) {
        const {name, control} = cfg;
        return formField({field: name, item: control});
    }

    onResetClick = () => {
        this.model.formModel.reset();
    }

    onSaveClick = () => {
        this.model.saveAsync();
    }

    onCloseClick = () => {
        this.model.hide();
    }
}

export const optionsDialog = elemFactory(OptionsDialog);
