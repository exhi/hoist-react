/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {dialog, dialogBody} from '@xh/hoist/kit/blueprint';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {filler} from '@xh/hoist/cmp/layout';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';

import {MessageModel} from '@xh/hoist/core/appcontainer/MessageModel';

/**
 * A modal dialog that supports imperative alert/confirm.
 *
 * @private
 */
@HoistComponent
export class Message extends Component {

    static modelClass = MessageModel;

    static propTypes = {
        /** Primary component model instance. */
        model: PT.oneOfType([PT.instanceOf(MessageModel), PT.object]).isRequired
    };

    render() {
        const model = this.model,
            isOpen = model && model.isOpen;

        if (!isOpen) return null;

        return dialog({
            isOpen: true,
            isCloseButtonShown: false,
            title: model.title,
            icon: model.icon,
            items: [
                dialogBody(model.message),
                toolbar(this.getButtons())
            ],
            ...this.props
        });
    }

    getButtons() {
        const {confirmText, cancelText, confirmIntent, cancelIntent} = this.model;
        return [
            filler(),
            button({
                text: cancelText,
                omit: !cancelText,
                intent: cancelIntent,
                onClick: this.onCancel
            }),
            button({
                text: confirmText,
                intent: confirmIntent,
                onClick: this.onConfirm
            })
        ];
    }

    onConfirm = () =>   {this.model.doConfirm()}
    onCancel = () =>    {this.model.doCancel()}
}
export const message = elemFactory(Message);
