/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {dialog} from '@xh/hoist/kit/blueprint';
import {XH, hoistCmpFactory, receive} from '@xh/hoist/core';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {frame, filler} from '@xh/hoist/cmp/layout';

import {AboutDialogModel} from '@xh/hoist/appcontainer/AboutDialogModel';
import './AboutDialog.scss';

/**
 * A dialog box showing basic metadata and version information about the Hoist application
 * and its plugins. Can also display the values of other soft-configuration entries as
 * specified by the xhAboutMenuConfigs configuration key.
 *
 * @private
 */
export const aboutDialog = hoistCmpFactory({
    model: receive(AboutDialogModel),

    render({model}) {
        if (!model.isOpen) return null;

        const onClose = () => model.hide();

        return dialog({
            isOpen: true,
            isCloseButtonShown: false,
            icon: Icon.info({size: 'lg'}),
            className: 'xh-about-dialog',
            title: `About ${XH.appName}`,
            style: {width: 450},
            items: [
                frame({
                    className: 'xh-about-dialog__inner',
                    item: model.getTable()
                }),
                toolbar(
                    filler(),
                    button({
                        text: 'Close',
                        intent: 'primary',
                        onClick: onClose
                    })
                )
            ],
            onClose
        });
    }
});