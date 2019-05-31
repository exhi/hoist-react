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
import {textArea} from '@xh/hoist/mobile/cmp/input';

import {FeedbackDialogModel} from '@xh/hoist/core/appcontainer/FeedbackDialogModel';
import './FeedbackDialog.scss';

/**
 * Display Feedback form
 *
 * @private
 */
@HoistComponent
export class FeedbackDialog extends Component {

    static modelClass = FeedbackDialogModel;

    static propTypes = {
        model: PT.oneOfType([PT.instanceOf(FeedbackDialogModel), PT.object]).isRequired
    };

    render() {
        const {model} = this;
        if (!model.isOpen) return null;

        return dialog({
            title: 'Submit Feedback',
            className: 'xh-feedback-dialog',
            isOpen: true,
            onCancel: this.onCancelClick,
            content: textArea({
                placeholder: 'Please enter your comments...',
                model,
                bind: 'message'
            }),
            buttons: [
                filler(),
                button({
                    text: 'Cancel',
                    modifier: 'quiet',
                    onClick: this.onCancelClick
                }),
                button({
                    text: 'Send',
                    onClick: this.onSendClick
                })
            ]
        });
    }

    onSendClick = () => {
        this.model.submitAsync();
    }

    onCancelClick = () => {
        this.model.hide();
    }
}
export const feedbackDialog = elemFactory(FeedbackDialog);
