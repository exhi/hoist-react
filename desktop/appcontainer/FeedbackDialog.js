/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {dialog} from '@xh/hoist/desktop/cmp/dialog';
import {filler} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses, XH} from '@xh/hoist/core';
import {button} from '@xh/hoist/desktop/cmp/button';
import {textArea} from '@xh/hoist/desktop/cmp/input';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';

import {FeedbackDialogModel} from '@xh/hoist/appcontainer/FeedbackDialogModel';

/**
 * A simple dialog component to collect user feedback from directly within the application.
 * @see FeedbackService
 *
 * @private
 */
export const feedbackDialog = hoistCmp.factory({
    displayName: 'FeedbackDialog',
    model: uses(FeedbackDialogModel),

    render({model}) {
        if (!model.isOpen) return null;

        const onClose = () => model.hide();

        return dialog({
            title: `${XH.clientAppName} Feedback`,
            model: {
                size: {width: 450},
                closeOnOutsideClick: false,
                onClose
            },
            items: [
                textArea({
                    placeholder: 'Please enter your comments...',
                    width: null,
                    autoFocus: true,
                    height: 250,
                    style: {marginBottom: 2},
                    commitOnChange: true,
                    bind: 'message'
                }),
                toolbar(
                    filler(),
                    button({
                        text: 'Cancel',
                        onClick: onClose
                    }),
                    button({
                        text: 'Send Feedback',
                        intent: 'success',
                        minimal: false,
                        disabled: !model.message,
                        onClick: () => model.submitAsync()
                    })
                )
            ]
        });
    }
});
