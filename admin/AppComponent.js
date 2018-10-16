/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {HoistComponent, XH} from '@xh/hoist/core';
import {tabContainer, tabSwitcher} from '@xh/hoist/desktop/cmp/tab';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {appBar, appBarSeparator} from '@xh/hoist/desktop/cmp/appbar';
import {ContextMenuItem, ContextMenuSupport} from '@xh/hoist/desktop/cmp/contextmenu';

import './App.scss';

@HoistComponent
@ContextMenuSupport
export class AppComponent extends Component {
    render() {
        return panel({
            tbar: this.renderAppBar(),
            className: 'xh-admin-app-frame',
            item: tabContainer({
                model: this.model.tabModel,
                switcherPosition: 'none'
            })
        });
    }

    getContextMenuItems() {
        const Item = ContextMenuItem;
        return [Item.reloadApp(), Item.about(), Item.logout()];
    }

    //------------------
    // Implementation
    //------------------
    renderAppBar() {
        return appBar({
            icon: Icon.gears({size: '2x', prefix: 'fal'}),
            title: `${XH.appName} Admin`,
            leftItems: [
                tabSwitcher({model: this.model.tabModel})
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
                appBarSeparator()
            ],
            hideAdminButton: true,
            hideFeedbackButton: true
        });
    }

    onContactClick = () => {
        window.open('https://xh.io/contact');
    };

    onOpenAppClick = () => {
        window.open('/');
    };
}