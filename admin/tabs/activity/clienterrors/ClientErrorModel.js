/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import moment from 'moment';
import {XH, HoistModel} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {LocalStore} from '@xh/hoist/data';
import {GridModel} from '@xh/hoist/desktop/cmp/grid';
import {fmtDate} from '@xh/hoist/format';
import {baseCol, boolCheckCol, compactDateCol} from '@xh/hoist/columns';
import {usernameCol} from '@xh/hoist/admin/columns';

@HoistModel()
export class ClientErrorModel {

    @observable startDate = moment().subtract(7, 'days').toDate();
    @observable endDate = moment().toDate();
    @observable username = '';
    @observable error = '';

    @observable detailRecord = null;

    gridModel = new GridModel({
        stateModel: 'xhClientErrorGrid',
        enableColChooser: true,
        enableExport: true,
        exportFilename: () => `Client Errors ${fmtDate(this.startDate)} to ${fmtDate(this.endDate)}`,
        store: new LocalStore({
            fields: [
                'username', 'error', 'msg', 'userAlerted', 'browser', 'device',
                'appVersion', 'appEnvironment', 'dateCreated', 'userAgent'
            ]
        }),
        sortBy: {colId: 'dateCreated', sort: 'desc'},
        columns: [
            compactDateCol({field: 'dateCreated', width: 100, align: 'right'}),
            usernameCol({width: 120}),
            baseCol({field: 'error', minWidth: 450, flex: true}),
            baseCol({field: 'msg', headerName: 'Message', minWidth: 150, flex: true}),
            boolCheckCol({field: 'userAlerted', headerName: 'User Alerted?', width: 120}),
            baseCol({field: 'browser', width: 100}),
            baseCol({field: 'device', width: 100}),
            baseCol({field: 'appVersion', width: 130}),
            baseCol({field: 'appEnvironment', headerName: 'Environment', width: 130})
        ]
    });

    async loadAsync() {
        return XH.fetchJson({
            url: 'clientErrorAdmin',
            params: this.getParams()
        }).then(data => {
            this.gridModel.loadData(data);
        }).catchDefault();
    }

    adjustDates(dir, toToday = false) {
        const today = moment(),
            start = moment(this.startDate),
            end = moment(this.endDate),
            diff = end.diff(start, 'days'),
            incr = diff + 1;

        let newStart = start[dir](incr, 'days'),
            newEnd = end[dir](incr, 'days');

        if (newEnd.diff(today, 'days') > 0 || toToday) {
            newStart = today.clone().subtract(diff, 'days');
            newEnd = today;
        }

        this.setStartDate(newStart.toDate());
        this.setEndDate(newEnd.toDate());
        this.loadAsync();
    }

    @action
    setStartDate(date) {
        if (!this.isValidDate(date) || moment(date).isSame(this.startDate)) return;
        this.startDate = date;
    }

    @action
    setEndDate(date) {
        if (!this.isValidDate(date) || moment(date).isSame(this.endDate)) return;
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
            startDate: fmtDate(this.startDate, 'YYYYMMDD'),
            endDate: fmtDate(this.endDate, 'YYYYMMDD'),
            username: this.username,
            error: this.error
        };
    }

    isValidDate(date) {
        return date && date.toString() !== 'Invalid Date';
    }

    destroy() {
        XH.safeDestroy(this.gridModel);
    }
}