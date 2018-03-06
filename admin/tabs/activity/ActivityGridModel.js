
/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import moment from 'moment';
import {forOwn} from 'lodash';
import {observable, setter, toJS} from 'hoist/mobx';
import {LocalStore} from 'hoist/data';
import {GridModel} from 'hoist/grid';
import {fmtDate, numberRenderer} from 'hoist/format';

import {baseCol} from 'hoist/columns/Core';
import {dateTimeCol} from 'hoist/columns/DatesTimes';
import {usernameCol} from '../../columns/Columns';

export class ActivityGridModel {

    @observable @setter startDate = moment('20170101').toDate();
    @observable @setter endDate = moment().toDate();
    @observable @setter username = '';
    @observable @setter msg = '';
    @observable @setter category = '';
    @observable @setter device = '';
    @observable @setter browser = '';

    store = new LocalStore({
        fields: [
            'severity', 'dateCreated', 'username', 'msg', 'category',
            'device', 'browser', 'data', 'impersonating', 'elapsed'
        ]
    });

    gridModel = new GridModel({
        store: this.store,
        columns: [
            baseCol({field: 'severity', width: 60}),
            dateTimeCol({field: 'dateCreated'}),
            usernameCol(),
            baseCol({field: 'msg', text: 'Message', width: 60}),
            baseCol({field: 'category', width: 100}),
            baseCol({field: 'device', width: 60}),
            baseCol({field: 'browser', width: 100}),
            baseCol({field: 'data', flex: 1}),
            baseCol({field: 'impersonating',  width: 120}),
            baseCol({
                field: 'elapsed',
                width: 60,
                valueFormatter: numberRenderer({precision: 0})
            })
        ]
    });


    // setFilter() {
    //     const store = this.store;
    //     store.setFilter(this.createFilterFunction());
    // }

    async loadAsync() {
        return XH.fetchJson({
            url: 'trackLogAdmin',
            params: this.getParams()
        }).then(data => {
            this.store.loadDataAsync(data)
        }).catchDefault({
            message: 'Failed to fetch track logs'
        });
    }

    //----------------
    // Implementation
    //----------------
    getParams() {
        let params = {
            startDate: fmtDate(this.startDate, 'YYYYMMDD'),
            endDate: fmtDate(this.endDate, 'YYYYMMDD')
        };
        // const {dateCreated, username, msg, category, device, browser} = rec,
        //     date = moment(dateCreated);
        // if (date.isBefore(this.startDate)) return false;
        // if (date.isAfter(this.endDate)) return false;
        // if (!username.toLowerCase().includes(this.username)) return false;
        // if (!msg.toLowerCase().includes(this.msg)) return false;
        // if (!category.toLowerCase().includes(this.category)) return false;
        // if (!device.toLowerCase().includes(this.device)) return false;
        // if (!browser.toLowerCase().includes(this.browser)) return false;
        return params;
    }

}