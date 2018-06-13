/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {navbar, navbarGroup, navbarHeading, button} from '@xh/hoist/kit/blueprint';
import {XH, HoistComponent} from '@xh/hoist/core';
import {lockoutPanel} from '@xh/hoist/app';
import {tabContainer} from '@xh/hoist/cmp/tab';
import {frame, panel} from '@xh/hoist/cmp/layout';
import {logoutButton, themeToggleButton, refreshButton} from '@xh/hoist/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {appBar} from '@xh/hoist/cmp/appbar';
import {tabSwitcher} from '@xh/hoist/cmp/tab';

import './App.scss';

@HoistComponent()
export class App extends Component {
    render() {
        if (!XH.getUser().isHoistAdmin) {
            return lockoutPanel({message: 'Access to this area requires administrator permissions.'});
        }

        return panel({
            tbar: this.renderNavBar(),
            item: frame({
                cls: 'xh-admin-app-frame',
                item: tabContainer({model: XH.appModel.tabs})
            })
        });
    }

    //------------------
    // Implementation
    //------------------
    renderNavBar() {
        return appBar({
            icon: Icon.gears({size: '2x'}),
            title: `${XH.appName} Admin`,
            leftItems: [
                tabSwitcher({
                    model: this.model.tabs,
                    large: false,
                })
            ],
            rightItems: [
                button({
                    icon: Icon.mail(),
                    text: 'Contact',
                    onClick: this.onContactClick
                }),
                button({
                    icon: Icon.openExternal(),
                    title: 'Open app...',
                    onClick: this.onOpenAppClick
                }),
                refreshButton({
                    intent: 'success',
                    onClick: this.onRefreshClick
                })
            ],
            adminButton: false
        });
    }

    onContactClick = () => {
        window.open('https://xh.io/contact');
    };

    onOpenAppClick = () => {
        window.open('/app');
    };

    onRefreshClick = () => {
        XH.appModel.requestRefresh();
    };
}