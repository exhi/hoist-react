/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed, LoadSupport} from '@xh/hoist/core';
import {RestGridModel, RestStore, deleteAction} from '@xh/hoist/desktop/cmp/rest';
import {compactDateCol} from '@xh/hoist/cmp/grid';
import {usernameCol} from '@xh/hoist/admin/columns';
import {textArea} from '@xh/hoist/desktop/cmp/input';

@HoistModel
@LoadSupport
export class FeedbackPanelModel {

    @managed
    gridModel = new RestGridModel({
        stateModel: 'xhFeedbackGrid',
        enableColChooser: true,
        enableExport: true,
        emptyText: 'No feedback reported...',
        store: new RestStore({
            url: 'rest/feedbackAdmin',
            fields: [
                {
                    name: 'username',
                    label: 'User'
                },
                {
                    name: 'msg',
                    label: 'Message'
                },
                {
                    name: 'browser'
                },
                {
                    name: 'device'
                },
                {
                    name: 'appVersion',
                    label: 'Version'
                },
                {
                    name: 'appEnvironment',
                    label: 'Environment'
                },
                {
                    name: 'dateCreated',
                    label: 'Date',
                    type: 'date'
                }
            ]
        }),
        toolbarActions: [deleteAction],
        menuActions: [deleteAction],
        formActions: [deleteAction],
        unit: 'report',
        sortBy: 'dateCreated|desc',
        filterFields: ['username', 'msg'],
        columns: [
            {field: 'dateCreated', ...compactDateCol, width: 140},
            {field: 'username', ...usernameCol},
            {field: 'browser', width: 120},
            {field: 'device', width: 100},
            {field: 'appVersion', headerName: 'Version', width: 120},
            {field: 'appEnvironment', headerName: 'Environment', width: 130},
            {field: 'msg', headerName: 'Message', minWidth: 120, flex: true}
        ],
        editors: [
            {field: 'username'},
            {field: 'msg', formField: {item: textArea()}},
            {field: 'browser'},
            {field: 'device'},
            {field: 'appVersion'},
            {field: 'appEnvironment'},
            {field: 'dateCreated'}
        ]
    });

    async doLoadAsync(loadSpec) {
        await this.gridModel.doLoadAsync(loadSpec);
    }
}