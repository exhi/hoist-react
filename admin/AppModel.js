/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, managed} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {activityTab} from './tabs/activity/ActivityTab';
import {generalTab} from './tabs/general/GeneralTab';
import {loggingTab} from './tabs/logging/LoggingTab';
import {monitorTab} from './tabs/monitor/MonitorTab';
import {preferencesTab} from './tabs/preferences/PreferencesTab';

@HoistAppModel
export class AppModel {

    @managed
    tabModel = new TabContainerModel({
        route: 'default',
        switcherPosition: 'none',
        tabs: this.createTabs()
    });

    getRoutes() {
        return [
            {
                name: 'default',
                path: '/admin',
                children: this.getTabRoutes()
            }
        ];
    }

    //------------------------
    // For override / extension
    //------------------------
    getTabRoutes() {
        return [
            {
                name: 'general',
                path: '/general',
                children: [
                    {name: 'about', path: '/about'},
                    {name: 'config', path: '/config'},
                    {name: 'services', path: '/services'},
                    {name: 'ehCache', path: '/ehCache'},
                    {name: 'users', path: '/users'},
                    {name: 'webSockets', path: '/webSockets'}
                ]
            },
            {
                name: 'logging',
                path: '/logging',
                children: [
                    {name: 'viewer', path: '/viewer'},
                    {name: 'config', path: '/config'}
                ]
            },
            {
                name: 'monitor',
                path: '/monitor',
                children: [
                    {name: 'status', path: '/status'},
                    {name: 'config', path: '/config'}
                ]
            },
            {
                name: 'activity',
                path: '/activity',
                children: [
                    {name: 'tracking', path: '/tracking'},
                    {name: 'clientErrors', path: '/clientErrors'},
                    {name: 'feedback', path: '/feedback'}
                ]
            },
            {
                name: 'preferences',
                path: '/preferences',
                children: [
                    {name: 'prefs', path: '/prefs'},
                    {name: 'userPrefs', path: '/userPrefs'}
                ]
            }
        ];
    }

    createTabs() {
        return [
            {id: 'general', icon: Icon.info(), content: generalTab},
            {id: 'activity', icon: Icon.analytics(), content: activityTab},
            {id: 'logging', icon: Icon.fileText(), content: loggingTab},
            {id: 'monitor', icon: Icon.shieldCheck(), content: monitorTab},
            {id: 'preferences', icon: Icon.bookmark(), content: preferencesTab}
        ];
    }
}
