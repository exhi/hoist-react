/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {XH, HoistComponent, elemFactory} from '@xh/hoist/core';
import {fragment, filler, pre, table, tbody, td, th, tr} from '@xh/hoist/cmp/layout';
import {dialog} from '@xh/hoist/mobile/cmp/dialog';
import {button} from '@xh/hoist/mobile/cmp/button';
import {textArea} from '@xh/hoist/mobile/cmp/input';
import {Icon} from '@xh/hoist/icon';
import {stringifyErrorSafely} from '@xh/hoist/exception';

import {dismissButton} from './ExceptionDialog';

/**
 * Sub-dialog for displaying exception details.  Includes affordances for submitting an
 * error report to the server.
 *
 * @private
 */
@HoistComponent
export class ExceptionDialogDetails extends Component {

    render() {
        const {model} = this,
            {detailsIsOpen, exception, options} = model,
            {requireReload} = options,
            row = (label, data) => tr(th({item: `${label}:`, style: {textAlign: 'left'}}), td(data));

        if (!detailsIsOpen || !exception) return null;

        this.errorStr = stringifyErrorSafely(exception);
        const header = table(
            tbody(
                row('Name', exception.name),
                row('Message', exception.msg || exception.message || 'N/A'),
                row('App Version', XH.appVersion)
            )
        );

        return dialog({
            title: 'Error Details',
            className: 'xh-exception-dialog-details',
            icon: Icon.search(),
            isOpen: true,
            isCloseButtonShown: !requireReload,
            onCancel: !requireReload ? this.onCloseClick : null,
            content: fragment(
                header,
                pre(this.errorStr),
                textArea({
                    placeholder: 'Add message here...',
                    model: model,
                    field: 'userMessage'
                })
            ),
            buttons: [
                button({
                    icon: Icon.envelope(),
                    text: 'Send',
                    disabled: !model.userMessage,
                    onClick: this.onSendClick
                }),
                filler(),
                dismissButton({model})
            ]
        });
    }


    //------------------------
    // Implementation
    //------------------------
    onSendClick = () => {
        this.model.sendReportAsync();
    }

    onCloseClick = () => {
        this.model.close();
    }
}

export const exceptionDialogDetails = elemFactory(ExceptionDialogDetails);
