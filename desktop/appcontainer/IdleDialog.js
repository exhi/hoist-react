/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {div, img, p} from '@xh/hoist/cmp/layout';
import {hoistCmp, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import './IdleDialog.scss';
import idleImage from './IdleDialogImage.png';
import {message} from './Message';


/**
 * Default dialog to display when the app has suspended itself due to inactivity.
 * This display can be overridden by applications - {@see AppSpec.idleDialogClass}. *
 * @private
 */
export const IdleDialog = hoistCmp({
    displayName: 'IdleDialog',

    render({onReactivate}) {
        return message({
            model: {
                title: `${XH.clientAppName} is sleeping`,
                icon: Icon.moon(),
                message: div(
                    img({
                        src: idleImage,
                        width: 300,
                        height: 180
                    }),
                    p('This application is sleeping due to inactivity.'),
                    p('Please click below to reload it.')
                ),
                confirmProps: {
                    text: "I'm back!",
                    intent: 'primary',
                    minimal: false,
                    autoFocus: true
                },
                onConfirm: onReactivate
            },
            className: 'xh-idle-dialog'
        });
    }
});