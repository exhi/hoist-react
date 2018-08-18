/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {SECONDS} from '@xh/hoist/utils/datetime';
import {action, observable, computed} from '@xh/hoist/mobx';
import {min} from 'lodash';
import {Timer} from '@xh/hoist/utils/async';

@HoistModel()
export class MonitorResultsModel {
    @observable.ref results = [];
    @observable lastRun = null;
    timer = null;
    view = null;

    @computed
    get passed() {
        return this.results.filter(monitor => monitor.status === 'OK').length;
    }

    @computed
    get warned() {
        return this.results.filter(monitor => monitor.status === 'WARN').length;
    }

    @computed
    get failed() {
        return this.results.filter(monitor => monitor.status === 'FAIL').length;
    }

    constructor({view}) {
        this.view = view;
        this.timer = Timer.create({
            runFn: () => this.loadAsync(),
            delay: 10 * SECONDS,
            interval: 10 * SECONDS
        });
    }
    
    async loadAsync() {
        if (!this.view.isDisplayed) return;

        return XH
            .fetchJson({url: 'monitorAdmin/results'})
            .then(rows => {
                this.completeLoad(true, rows);
            }).catch(e => {
                this.completeLoad(false, e);
                XH.handleException(e);
            });
    }

    @action
    completeLoad(success, vals) {
        this.results = success ? Object.values(vals) : [];
        this.getLastRun();
    }

    async forceRunAllMonitors() {
        return XH
            .fetchJson({url: 'monitorAdmin/forceRunAllMonitors'})
            .then(() => {
                XH.toast({message: 'Request received. Results will be generated shortly.'});
            })
            .catchDefault();
    }

    @action
    getLastRun() {
        const lastRun = min(this.results.
            filter(monitor => monitor.status !== 'UNKNOWN')
            .map(it => it.date));

        this.lastRun = lastRun ? new Date(lastRun) : null;
    }
}