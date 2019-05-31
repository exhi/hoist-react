/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {filler} from '@xh/hoist/cmp/layout';
import {dialog} from '@xh/hoist/mobile/cmp/dialog';
import {button} from '@xh/hoist/mobile/cmp/button';
import {MessageModel} from '@xh/hoist/core/appcontainer/MessageModel';

/**
 * Render a modal dialog
 *
 * @private
 */
@HoistComponent
class Message extends Component {

    static modelClass = MessageModel;

    static propTypes = {
        /** Primary component model instance. */
        model: PT.oneOfType([PT.instanceOf(MessageModel), PT.object]).isRequired
    };

    render() {
        const model = this.model,
            isOpen = model && model.isOpen,
            {icon, title, message, cancelText, confirmText} = model,
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
            content: message,
            onCancel: this.onCancel
        });
    }

    onConfirm = () =>   {this.model.doConfirm()}
    onCancel = () =>    {this.model.doCancel()}

}
export const message = elemFactory(Message);
