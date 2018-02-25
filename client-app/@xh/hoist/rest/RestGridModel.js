/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {remove} from 'lodash';
import {XH} from 'hoist/app';
import {action} from 'hoist/mobx';
import {RecordSpec} from 'hoist/data';
import {GridModel} from 'hoist/grid';
import {ConfirmModel} from 'hoist/cmp/confirm/ConfirmModel';


import {RestFormModel} from './RestFormModel';

/**
 * Core Model for a RestGrid
 */
export class RestGridModel {

    //----------------
    // Properties
    //----------------
    actionEnabled = {
        add: true,
        edit: true,
        del: true
    }

    actionWarning = {
        add: null,
        edit: null,
        del: 'Are you sure you want to delete the selected record(s)?'
    }

    gridModel = null;
    formModel = null;
    recordSpec = null;
    _lookupsLoaded = false;

    confirmModel = new ConfirmModel();

    get url()       {return this.gridModel.url}
    get selection() {return this.gridModel.selection}
    get loadModel() {return this.gridModel.loadModel}
    get records()   {return this.gridModel.records}

    constructor({
        actionEnabled,
        actionWarning,
        recordSpec,
        editors = [],
        dataRoot = 'data',
        ...rest
    }) {
        this.actionEnabled = Object.assign(this.actionEnabled, actionEnabled);
        this.actionWarning = Object.assign(this.actionWarning, actionWarning);
        this.recordSpec = recordSpec instanceof RecordSpec ? recordSpec : new RecordSpec(recordSpec);
        this.formModel = new RestFormModel({parent: this, editors});
        this.gridModel = new GridModel({dataRoot, ...rest});
    }

    async loadAsync() {
        if (!this._lookupsLoaded) {
            const lookupFields = this.recordSpec.fields.filter(it => !!it.lookup);
            if (lookupFields.length) {
                const lookupData = await XH.fetchJson({url: `${this.url}/lookupData`});
                lookupFields.forEach(f => {
                    f.lookupValues = lookupData[f.lookup];
                });
                this._lookupsLoaded = true;
            }
        }

        return this.gridModel.loadAsync();
    }

    //-----------------
    // Actions
    //------------------
    @action
    deleteRecord(rec) {
        const {url, actionEnabled} = this;

        if (!actionEnabled.del) throw XH.exception('Record delete not enabled.');

        return XH.fetchJson({
            url: `${url}/${rec.id}`,
            method: 'DELETE'
        }).then(() => {
            this.noteRecordDeleted(rec);
        }).linkTo(
            this.loadModel
        ).catchDefault();
    }

    @action
    saveRecord(rec) {
        let {url, actionEnabled} = this,
            {isAdd} = this.formModel;

        if (isAdd && !actionEnabled.add) throw XH.exception('Record addition not enabled.');
        if (!isAdd && !actionEnabled.edit) throw XH.exception('Record edits not enabled.');
        if (!isAdd) url += '/' + rec.id;

        XH.fetchJson({
            url,
            method: isAdd ? 'POST' : 'PUT',
            contentType: 'application/json',
            body: JSON.stringify({data: rec})
        }).then(response => {
            this.noteRecordUpdated(response.data);
        }).linkTo(
            this.loadModel
        ).catchDefault();
    }

    @action
    addRecord() {
        this.formModel.openAdd();
    }

    @action
    deleteSelection() {
        this.deleteRecord(this.selection.singleRecord);
    }

    @action
    editSelection() {
        this.formModel.openEdit(this.selection.singleRecord);
    }

    //--------------
    // Implementation
    //--------------
    @action
    noteRecordUpdated(rec) {
        const records = this.records,
            idx = records.findIndex(r => r.id === rec.id);

        if (idx < 0) {
            records.push(rec);
        } else {
            records[idx] = rec;
        }
        this.formModel.close();
    }

    @action
    noteRecordDeleted(rec) {
        remove(this.records, r => r.id === rec.id);
        this.formModel.close();
    }
}