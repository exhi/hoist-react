/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {elemFactory} from 'hoist';
import {textArea, button, dialog, dialogBody, dialogFooter, dialogFooterActions} from 'hoist/kit/blueprint';
import {vbox, spacer, vframe} from 'hoist/layout';
import {observer} from 'hoist/mobx';
import {stringifyErrorSafely} from 'hoist/exception';

@observer
export class ErrorDialogDetails extends Component {

    render() {
        const model = this.model,
            {detailsVisible, exception} = model;

        if (!detailsVisible || !exception) return null;

        return dialog({
            title: 'Error Details',
            iconName: 'search',
            isOpen: true,
            onClose: this.onCloseClick,
            items: [
                dialogBody(
                    vbox(
                        vframe({
                            padding: 5,
                            style: {border: '1px solid'},
                            item: stringifyErrorSafely(exception)
                        }),
                        spacer({height: 10}),
                        textArea({
                            rows: 12,
                            placeholder: 'Add message here...',
                            value: model.msg,
                            onChange: this.onMessageChange
                        })
                    )
                ),
                dialogFooter(
                    dialogFooterActions({
                        itemSpec: button,
                        items: [{
                            iconName: 'envelope',
                            text: 'Send',
                            onClick: this.onSendClick
                        }, {
                            iconName: 'clipboard',
                            text: 'Copy',
                            onClick: this.onCopyClick
                        }, {
                            iconName: 'cross',
                            text: 'Close',
                            onClick: this.onCloseClick
                        }]
                    })
                )
            ]
        });
    }

    //--------------------------------
    // Implementation
    //--------------------------------
    get model() {return this.props.model}

    onMessageChange = (evt) => {
        this.model.setMsg(evt.target.value);
    }

    onSendClick = () => {
        this.model.sendReport();
    }

    onCopyClick = () => {}

    onCloseClick = () => {
        this.model.close();
    }
}
export const errorDialogDetails = elemFactory(ErrorDialogDetails);
