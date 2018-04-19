/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, hoistComponent, elemFactory} from 'hoist/core';
import {frame, table, tbody, tr, th, td, filler} from 'hoist/layout';
import {toolbar} from 'hoist/cmp/toolbar';
import {Icon} from 'hoist/icon';
import {dialog, button} from 'hoist/kit/blueprint';
import './AboutDialog.scss';

/**
 * A dialog box showing basic metadata and version information about the Hoist application
 * and its plugins. Can also display the values of other soft-configuration entries as
 * specified by the xhAboutMenuConfigs configuration key.
 */
@hoistComponent()
export class AboutDialog extends Component {
    render() {
        // done open/close remove before merge
        return dialog({
            isOpen: XH.hoistModel.aboutIsOpen,
            isCloseButtonShown: false,
            icon: Icon.info({size: 'lg'}),
            cls: 'xh-about-dialog',
            title: `About ${XH.appName}`,
            style: {width: 450},
            items: [
                frame({
                    cls: 'xh-about-dialog__inner',
                    item: this.renderTable()
                }),
                toolbar({
                    items: [
                        filler(),
                        button({
                            text: 'Close',
                            intent: 'primary',
                            onClick: this.onClose
                        })
                    ]
                })
            ],
            onClose: this.onClose
        });
    }


    //------------------------
    // Implementation
    //------------------------
    renderTable() {
        const svc = XH.environmentService,
            row = (label, data) => tr(th(label), td(data)),
            configRows = XH.getConf('xhAboutMenuConfigs', []).map(it => {
                return row(it.label, XH.getConf(it.key, ''));
            });

        return table({
            item: tbody(
                row('App Name', svc.get('appName')),
                row('Current User', XH.identityService.username),
                row('Environment', svc.get('appEnvironment')),
                row('Server', svc.get('appVersion')),
                row('Client', svc.get('clientVersion')),
                row('Hoist Core', svc.get('hoistCoreVersion')),
                row('Hoist React', svc.get('hoistReactVersion')),
                row('Build', svc.get('clientBuild')),
                row('User Agent', navigator.userAgent),
                ...configRows
            )
        });
    }

    onClose = () => {
        XH.hoistModel.closeAbout();
    }
}
export const aboutDialog = elemFactory(AboutDialog);