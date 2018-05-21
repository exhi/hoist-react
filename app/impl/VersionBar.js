/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {box} from '@xh/hoist/cmp/layout';
import {Icon} from '@xh/hoist/icon';
import './VersionBar.scss';

@HoistComponent()
export class VersionBar extends Component {

    render() {
        const env = XH.getEnv('appEnvironment'),
            version = XH.getEnv('appVersion'),
            isVisible = (env !== 'Production' || XH.getPref('xhForceEnvironmentFooter')),
            cls = `xh-version-bar xh-version-bar-${env.toLowerCase()}`,
            info = Icon.info({onClick: this.showAbout});

        if (!isVisible) return null;

        return box({
            justifyContent: 'center',
            alignItems: 'center',
            flex: 'none',
            cls,
            items: [
                [XH.appName, env, version].join(' • '),
                info
            ]
        });
    }

    showAbout() {
        XH.showAbout();
    }
}
export const versionBar = elemFactory(VersionBar);