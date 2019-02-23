/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {AppState, XH} from '@xh/hoist/core';
import {MINUTES} from '@xh/hoist/utils/datetime';
import {Timer} from '@xh/hoist/utils/async';
import {debounce} from 'lodash';

/**
 * Manage the idling/suspension of this application after a certain period of user inactivity
 * to cancel background tasks and prompt the user to reload the page when they wish to resume
 * using the app. This approach is typically employed to reduce potential load on back-end
 * system from unattended clients and/or as a "belt-and-suspenders" defence against memory
 * leaks or other performance issues that can arise with long-running sessions.
 *
 * This service consults the AppSpec `idleDetectionEnabled` property, the `xhIdleTimeoutMins`
 * soft-config, and the `xh.disableIdleDetection` user preference to determine if and when it
 * should suspend the app.
 *
 * Not currently supported / enabled for mobile clients.
 */
export class BaseIdleService {

    ACTIVITY_EVENTS = ['keydown', 'mousemove', 'mousedown', 'scroll'];

    constructor() {
        this.addReaction({
            when: () => XH.appIsRunning,
            run: this.startMonitoring
        });
    }

    //------------------------
    // Implementation
    //------------------------
    startMonitoring() {
        const timeout = XH.getConf('xhIdleTimeoutMins') * MINUTES,
            appEnabled = XH.appSpec.idleDetectionEnabled,
            configEnabled = timeout > 0,
            userEnabled = !XH.getPref('xhIdleDetectionDisabled');

        if (appEnabled && configEnabled && userEnabled) {
            this.startCountdown = debounce(() => this.suspendApp(), timeout, {trailing: true});
            this.startCountdown();
            this.createAppListeners();
        }
    }

    createAppListeners() {
        this.ACTIVITY_EVENTS.forEach(e => {
            window.addEventListener(e, this.startCountdown, true);
        });
    }

    destroyAppListeners() {
        this.ACTIVITY_EVENTS.forEach(e => {
            window.removeEventListener(e, this.startCountdown, true);
        });
    }

    suspendApp() {
        if (XH.appState != AppState.SUSPENDED) {
            XH.setAppState(AppState.SUSPENDED);
            this.destroyAppListeners();
            Timer.cancelAll();
        }
    }
}