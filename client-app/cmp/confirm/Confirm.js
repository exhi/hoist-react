/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {elemFactory} from 'hoist';
import {filler} from 'hoist/layout';
import {button, dialog, dialogBody, dialogFooter, dialogFooterActions} from 'hoist/kit/blueprint';

import {observer} from 'hoist/mobx';

@observer
class Confirm extends Component {

    render() {
        const isOpen = this.model && this.model.isOpen;

        console.log('confirm render');
        if (!isOpen) return null;

        return dialog({
            isOpen: true,
            isCloseButtonShown: false,
            title: 'Confirm',
            items: [
                dialogBody(this.model.message),
                dialogFooter(
                    dialogFooterActions(this.getConfirmButtons())
                )
            ]
        });
    }

    getConfirmButtons() {
        return [
            filler(),
            button({
                text: 'Yes',
                onClick: this.model.doConfirm
            }),
            button({
                text: 'No',
                onClick: this.model.doReject
            }),
            filler()
        ];
    }

    get model() {return this.props.model}
};

export const confirm = elemFactory(Confirm);