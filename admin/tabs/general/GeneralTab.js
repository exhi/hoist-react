/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {tabContainer} from '@xh/hoist/cmp/tab';
import {HoistComponent} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {Component} from 'react';
import {AboutPanel} from './about/AboutPanel';
import {ConfigPanel} from './configs/ConfigPanel';
import {EhCachePanel} from './ehcache/EhCachePanel';
import {ServicePanel} from './services/ServicePanel';
import {UserPanel} from './users/UserPanel';
import {WebSocketPanel} from './websocket/WebSocketPanel';

@HoistComponent
export class GeneralTab extends Component {

    render() {
        return tabContainer({
            model: {
                route: 'default.general',
                switcherPosition: 'left',
                tabs: [
                    {id: 'about', icon: Icon.info(), content: AboutPanel},
                    {id: 'config', icon: Icon.settings(), content: ConfigPanel},
                    {id: 'services', icon: Icon.gears(), content: ServicePanel},
                    {id: 'ehCache', icon: Icon.database(), title: 'Caches', content: EhCachePanel},
                    {id: 'users', icon: Icon.users(), content: UserPanel},
                    {id: 'webSockets', title: 'WebSockets', icon: Icon.bolt(), content: WebSocketPanel}
                ]
            }
        });
    }
}
