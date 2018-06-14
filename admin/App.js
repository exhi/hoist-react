/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH, HoistApp} from '@xh/hoist/core';
import {action} from '@xh/hoist/mobx';
import {TabContainerModel} from '@xh/hoist/cmp/tab';

import {AppComponent} from './AppComponent';
import {AboutPanel} from './tabs/about/AboutPanel';
import {ActivityPanel} from './tabs/activity/ActivityPanel';
import {ConfigPanel} from './tabs/configs/ConfigPanel';
import {ClientErrorPanel} from './tabs/clienterrors/ClientErrorPanel';
import {FeedbackPanel} from './tabs/feedback/FeedbackPanel';
import {EhCachePanel} from './tabs/ehcache/EhCachePanel';
import {LogLevelPanel} from './tabs/logging/LogLevelPanel';
import {LogViewer} from './tabs/logging/viewer/LogViewer';
import {MonitorResultsPanel} from './tabs/monitor/MonitorResultsPanel';
import {MonitorEditorPanel} from './tabs/monitor/MonitorEditorPanel';
import {PreferencePanel} from './tabs/preferences/PreferencePanel';
import {UserPreferencePanel} from './tabs/preferences/UserPreferencePanel';
import {ServicePanel} from './tabs/services/ServicePanel';
import {UserPanel} from './tabs/users/UserPanel';

@HoistApp
export class App {

    tabs = this.createTabContainer();

    checkAccess(user) {
        const role = 'HOIST_ADMIN',
            hasAccess = user.hasRole(role),
            message = hasAccess ? '' : `Admin console access requires the "${role}" role.`;
        return {hasAccess, message};
    }

    get viewClass() {return AppComponent}
    
    @action
    requestRefresh() {
        this.tabs.requestRefresh();
    }

    getRoutes() {
        return [
            {
                name: 'default',
                path: '/admin',
                forwardTo: 'default.general',
                children: this.getTabRoutes()
            }
        ];
    }

    //------------------------
    // Implementation
    //------------------------
    createTabContainer() {
        return new TabContainerModel({
            id: 'default',
            useRoutes: true,
            children: this.createTabs()
        });
    }

    //------------------------
    // For override / extension
    //------------------------
    getTabRoutes() {
        return [
            {
                name: 'general',
                path: '/general',
                forwardTo: 'default.general.about',
                children: [
                    {name: 'about', path: '/about'},
                    {name: 'config', path: '/config'},
                    {name: 'services', path: '/services'},
                    {name: 'ehCache', path: '/ehCache'},
                    {name: 'users', path: '/users'}
                ]
            },
            {
                name: 'logging',
                path: '/logging',
                forwardTo: 'default.logging.viewer',
                children: [
                    {name: 'viewer', path: '/viewer'},
                    {name: 'levels', path: '/levels'}
                ]
            },
            {
                name: 'monitor',
                path: '/monitor',
                forwardTo: 'default.monitor.status',
                children: [
                    {name: 'status', path: '/status'},
                    {name: 'editMonitors', path: '/editMonitors'}
                ]
            },       {
                name: 'clientActivity',
                path: '/clientActivity',
                forwardTo: 'default.clientActivity.activity',
                children: [
                    {name: 'activity', path: '/activity'},
                    {name: 'clientErrors', path: '/clientErrors'},
                    {name: 'feedback', path: '/feedback'}
                ]
            },
            {
                name: 'preferences',
                path: '/preferences',
                forwardTo: 'default.preferences.prefs',
                children: [
                    {name: 'prefs', path: '/prefs'},
                    {name: 'userPrefs', path: '/userPrefs'}
                ]
            }
        ];
    }

    createTabs() {
        return [
            {
                id: 'general',
                switcherPosition: 'left',
                children: [
                    {id: 'about', component: AboutPanel},
                    {id: 'config', component: ConfigPanel},
                    {id: 'services', component: ServicePanel},
                    {id: 'ehCache', name: 'Caches', component: EhCachePanel},
                    {id: 'users', component: UserPanel}
                ]
            }, {
                id: 'logging',
                switcherPosition: 'left',
                children: [
                    {id: 'viewer', component: LogViewer},
                    {id: 'levels', component: LogLevelPanel}
                ]
            },
            {
                id: 'monitor',
                switcherPosition: 'left',
                children: [
                    {id: 'status', component: MonitorResultsPanel},
                    {id: 'editMonitors', component: MonitorEditorPanel}
                ]
            },
            {
                id: 'clientActivity',
                switcherPosition: 'left',
                children: [
                    {id: 'activity', component: ActivityPanel},
                    {id: 'clientErrors', component: ClientErrorPanel},
                    {id: 'feedback', component: FeedbackPanel}
                ]
            },
            {
                id: 'preferences',
                switcherPosition: 'left',
                children: [
                    {id: 'prefs', component: PreferencePanel},
                    {id: 'userPrefs', component: UserPreferencePanel, reloadOnShow: true}
                ]
            }
        ];
    }

    destroy() {
        XH.safeDestroy(this.tabs);
    }
}
