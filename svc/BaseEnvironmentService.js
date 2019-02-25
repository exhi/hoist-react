/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {Timer} from '@xh/hoist/utils/async';
import {SECONDS} from '@xh/hoist/utils/datetime';

export class BaseEnvironmentService {

    async initAsync() {
        this.adjustDocTitleForNonProdEnv();
        this.addReaction({
            when: () => XH.appIsRunning,
            run: this.startVersionChecking
        });
    }

    get(key) {
    }

    isProduction() {
        return this.get('appEnvironment') === 'Production';
    }

    //------------------------------
    // Implementation
    //------------------------------
    adjustDocTitleForNonProdEnv() {
        const env = this.get('appEnvironment');
        if (env != 'Production') {
            document.title += ` (${env})`;
        }
    }

    startVersionChecking() {
        const interval = XH.getConf('xhAppVersionCheckSecs');
        Timer.create({
            runFn: () => this.checkAppVersionAsync,
            interval: interval * SECONDS
        });
    }

    async checkAppVersionAsync() {
        const data = await XH.fetchJson({url: 'xh/version'}),
            shouldUpdate = data.shouldUpdate,
            appVersion = data.appVersion;

        if (shouldUpdate && appVersion !== XH.appVersion) {
            XH.appContainerModel.showUpdateBar(data.appVersion);
        }
    }

    /**
     * Get version from server.
     *
     * Should return values:
     *   shouldUpdate
     *   appVersion
     *
     * @returns {Promise<void>}
     */
    async getServiceVersionAsync() {}
}
