/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {div, filler} from '@xh/hoist/cmp/layout';
import {form} from '@xh/hoist/cmp/form';
import {formField} from '@xh/hoist/mobile/cmp/form';
import {textInput} from '@xh/hoist/mobile/cmp/input';
import {dialog} from '@xh/hoist/mobile/cmp/dialog';
import {button} from '@xh/hoist/mobile/cmp/button';

import './Message.scss';
import {MessageModel} from '@xh/hoist/core/appcontainer/MessageModel';

/**
 * Render a modal dialog
 *
 * @private
 */
@HoistComponent
class Message extends Component {

    static modelClass = MessageModel;

    render() {
        const model = this.model,
            isOpen = model && model.isOpen,
            {icon, title, message, input, formModel, cancelText, confirmText} = model,
            buttons = [];

        if (!isOpen) return null;

        if (cancelText) {
            buttons.push(button({
                text: cancelText,
                modifier: 'quiet',
                onClick: this.onCancel
            }));
        }

        if (confirmText) {
            buttons.push(button({
                text: confirmText,
                disabled: input ? !formModel.isValid : false,
                onClick: this.onConfirm
            }));
        }

        if (buttons.length) {
            buttons.unshift(filler());
        }

        return dialog({
            isOpen,
            icon,
            title,
            buttons,
            className: 'xh-message',
            content: div(
                div({omit: !message, className: 'xh-message-content', item: message}),
                this.getInput()
            ),
            onCancel: this.onCancel
        });
    }

    getInput() {
        const {input, formModel} = this.model;
        if (!input) return null;
        return form({
            model: formModel,
            fieldDefaults: {commitOnChange: true, minimal: true, label: null},
            item: formField({
                field: 'value',
                item: input == true ? textInput({autoFocus: true}) : input
            })
        });
    }

    onConfirm = () =>   {this.model.doConfirm()};
    onCancel = () =>    {this.model.doCancel()};

}
export const message = elemFactory(Message);
