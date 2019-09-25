/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {sync, SyncSupport} from '../openfin';

/**
 *  Manage Theme.
 *
 *  @private
 */
@HoistModel
@SyncSupport('xh-theme', 'auto')
export class ThemeModel {

    @observable @sync darkTheme = false;

    @action
    toggleTheme() {
        this.setDarkTheme(!this.darkTheme);
    }

    @action
    setDarkTheme(value) {
        this.darkTheme = value;
        XH.setPref('xhTheme', value ? 'dark' : 'light');
    }

    init() {
        this.setDarkTheme(XH.getPref('xhTheme') === 'dark');
    }
}