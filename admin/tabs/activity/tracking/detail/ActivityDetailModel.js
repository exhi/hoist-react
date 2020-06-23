import {usernameCol} from '@xh/hoist/admin/columns';
import {FormModel} from '@xh/hoist/cmp/form';
import {dateTimeCol, GridModel} from '@xh/hoist/cmp/grid';
import {HoistModel, XH} from '@xh/hoist/core';
import {numberRenderer} from '@xh/hoist/format';
import {wait} from '@xh/hoist/promise';

@HoistModel
export class ActivityDetailModel {

    /** @member {ActivityModel} */
    parentModel;

    /** @member {GridModel} */
    gridModel = new GridModel({
        sortBy: 'dateCreated|desc',
        enableColChooser: true,
        enableExport: true,
        exportOptions: {filename: `${XH.appCode}-activity-detail`},
        emptyText: 'Select a group on the left to see detailed tracking logs.',
        columns: [
            {field: 'username', ...usernameCol},
            {field: 'category', width: 100},
            {field: 'device', width: 100},
            {field: 'browser', width: 100},
            {field: 'userAgent', width: 100, hidden: true},
            {field: 'impersonating', width: 140, hidden: true},
            {
                field: 'elapsed',
                headerName: 'Elapsed (ms)',
                width: 130,
                align: 'right',
                renderer: numberRenderer({formatConfig: {thousandSeparated: false, mantissa: 0}})
            },
            {field: 'msg', headerName: 'Message', flex: true, minWidth: 120, autosizeMaxWidth: 400},
            {field: 'data', width: 70, autosizeMaxWidth: 400, hidden: true},
            {field: 'dateCreated', headerName: 'Timestamp', ...dateTimeCol}
        ]
    });

    detailFormModel = new FormModel({
        readonly: true,
        fields: this.gridModel.columns.map(it => ({name: it.field, displayName: it.headerName}))
    });

    constructor({parentModel}) {
        this.parentModel = parentModel;

        this.addReaction({
            track: () => this.parentModel.gridModel.selectedRecord,
            run: (aggRec) => this.showActivityEntriesAsync(aggRec)
        });

        this.addReaction({
            track: () => this.gridModel.selectedRecord,
            run: (detailRec) => this.showEntryDetail(detailRec)
        });
    }

    showEntryDetail(detailRec) {
        this.detailFormModel.init(detailRec?.data ?? {});
    }

    async showActivityEntriesAsync(aggRec) {
        const {gridModel} = this,
            leaves = this.getAllLeafRows(aggRec);

        gridModel.loadData(leaves);

        await wait(1);
        if (!gridModel.hasSelection) {
            gridModel.selectFirst();
        }
    }

    getAllLeafRows(aggRec, ret = []) {
        if (!aggRec) return [];

        if (aggRec.children.length) {
            aggRec.children.forEach(childRec => this.getAllLeafRows(childRec, ret));
        } else if (aggRec.raw.leafRows) {
            aggRec.raw.leafRows.forEach(leaf => {
                ret.push({...leaf});
            });
        }

        return ret;
    }

}