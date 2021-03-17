/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed, XH} from '@xh/hoist/core';
import {action, computed, observable, makeObservable} from '@xh/hoist/mobx';
import {TilingContainerModel} from '@xh/hoist/cmp/tile';
import {Timer} from '@xh/hoist/utils/async';
import {SECONDS} from '@xh/hoist/utils/datetime';
import {isDisplayed} from '@xh/hoist/utils/js';
import {createObservableRef} from '@xh/hoist/utils/react';
import {min} from 'lodash';

import {tile} from './Tile';

export class MonitorResultsModel extends HoistModel {

    @observable.ref results = [];
    @observable lastRun = null;

    @managed tilingContainerModel;
    @managed timer = null;
    viewRef = createObservableRef();

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

    @computed
    get inactive() {
        return this.results.filter(monitor => monitor.status === 'INACTIVE').length;
    }

    constructor() {
        super();
        makeObservable(this);

        this.tilingContainerModel = new TilingContainerModel({
            content: tile,
            emptyText: 'No monitors configured for this application.',
            spacing: 10,
            desiredRatio: 3,
            minWidth: 300,
            maxWidth: 600,
            minHeight: 160,
            maxHeight: 160
        });

        this.timer = Timer.create({
            runFn: () => this.autoRefreshAsync(),
            interval: 10 * SECONDS,
            delay: true
        });
    }

    async doLoadAsync(loadSpec) {
        if (!isDisplayed(this.viewRef.current)) return;

        return XH
            .fetchJson({url: 'monitorAdmin/results', loadSpec})
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
        this.tilingContainerModel.loadData(this.results);
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
