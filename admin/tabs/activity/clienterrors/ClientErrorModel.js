/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel, managed, LoadSupport} from '@xh/hoist/core';
import {action, observable, comparer} from '@xh/hoist/mobx';
import {GridModel} from '@xh/hoist/cmp/grid';
import {fmtDate, fmtSpan} from '@xh/hoist/format';
import {boolCheckCol, compactDateCol} from '@xh/hoist/cmp/grid';
import {usernameCol} from '@xh/hoist/admin/columns';
import {LocalDate, DAYS} from '@xh/hoist/utils/datetime';

@HoistModel
@LoadSupport
export class ClientErrorModel {

    @observable startDate = new LocalDate().subtract(7);
    @observable endDate = new LocalDate();
    @observable username = '';
    @observable error = '';

    @observable detailRecord = null;
    
    @managed
    gridModel = new GridModel({
        stateModel: 'xhClientErrorGrid',
        enableColChooser: true,
        enableExport: true,
        exportOptions: {filename: () => `Client Errors ${fmtDate(this.startDate)} to ${fmtDate(this.endDate)}`},
        emptyText: 'No errors reported...',
        sortBy: 'dateCreated|desc',
        columns: [
            {field: 'dateCreated', ...compactDateCol, width: 140},
            {field: 'username', ...usernameCol},
            {field: 'userAlerted', ...boolCheckCol, headerName: 'Alerted', width: 90},
            {field: 'browser', width: 100},
            {field: 'device', width: 100},
            {field: 'userAgent', width: 130, hidden: true},
            {field: 'appVersion', width: 130},
            {field: 'appEnvironment', headerName: 'Environment', width: 130},
            {field: 'msg', width: 130, hidden: true},
            {field: 'error', flex: true, minWidth: 150, renderer: (e) => fmtSpan(e)}
        ]
    });

    constructor() {
        this.addReaction({
            track: () => this.getParams(),
            run: () => this.loadAsync(),
            equals: comparer.structural
        });
    }

    async doLoadAsync(loadSpec) {
        return XH.fetchJson({
            url: 'clientErrorAdmin',
            params: this.getParams(),
            loadSpec
        }).then(data => {
            this.gridModel.loadData(data);
        }).catchDefault();
    }

    adjustDates(dir, toToday = false) {
        const today = new LocalDate(),
            start = this.startDate,
            end = this.endDate,
            diff = end.diff(start) / DAYS,
            incr = diff + 1;

        let newStart = start[dir](incr),
            newEnd = end[dir](incr);

        if (newEnd.diff(today) > 0 || toToday) {
            newStart = today.subtract(Math.abs(diff));
            newEnd = today;
        }

        this.setStartDate(newStart);
        this.setEndDate(newEnd);
        this.loadAsync();
    }

    @action
    setStartDate(date) {
        if (!this.isValidDate(date) || date.equals(this.startDate)) return;
        this.startDate = date;
    }

    @action
    setEndDate(date) {
        if (!this.isValidDate(date) || date.equals(this.endDate)) return;
        this.endDate = date;
    }

    @action
    setUsername(username) {
        this.username = username;
    }

    @action
    setError(error) {
        this.error = error;
    }

    @action
    openDetail(rec) {
        this.detailRecord = rec;
    }

    @action
    closeDetail() {
        this.detailRecord = null;
    }

    //------------------------
    // Implementation
    //------------------------
    getParams() {
        return {
            startDate: this.startDate.value,
            endDate: this.endDate.value,
            username: this.username,
            error: this.error
        };
    }

    isValidDate(date) {
        return date && date.toString() !== 'Invalid Date';
    }
}