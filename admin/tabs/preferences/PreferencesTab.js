/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent} from '@xh/hoist/core';
import {tabContainer} from '@xh/hoist/desktop/cmp/tab';

import {PreferencePanel} from './PreferencePanel';
import {UserPreferencePanel} from './UserPreferencePanel';


@HoistComponent
export class PreferencesTab extends Component {

    render() {
        return tabContainer({
            model: {
                route: 'default.preferences',
                tabs: [
                    {id: 'prefs', content: PreferencePanel},
                    {id: 'userPrefs', content: UserPreferencePanel, reloadOnShow: true}
                ]
            },
            switcherPosition: 'left'
        });
    }
}
