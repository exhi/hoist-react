/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {table, tbody, tr, th, td} from '@xh/hoist/cmp/layout';

/**
 * Support for About Dialog.
 *  @private
 */
@HoistModel
export class AboutDialogModel {

    @observable isOpen = false;

    @action
    show() {
        this.isOpen = true;
    }

    @action
    hide() {
        this.isOpen = false;
    }

    getTable() {
        const svc = XH.environmentService,
            row = (label, data) => tr(th(label), td(data)),
            configRows = XH.getConf('xhAboutMenuConfigs', []).map(it => {
                return row(it.label, XH.getConf(it.key, ''));
            });

        return table({
            item: tbody(
                row('App', `${svc.get('appName')} (${svc.get('appCode')})`),
                row('Current User', XH.identityService.username),
                row('Environment', svc.get('appEnvironment')),
                row('Server', svc.get('appVersion')),
                row('Client', svc.get('clientVersion')),
                row('Hoist Core', svc.get('hoistCoreVersion')),
                row('Hoist React', svc.get('hoistReactVersion')),
                row('Build', svc.get('clientBuild')),
                row('User Agent', window.navigator.userAgent),
                ...configRows
            )
        });
    }
}
