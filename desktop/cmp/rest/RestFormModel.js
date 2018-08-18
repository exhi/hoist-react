/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {start} from '@xh/hoist/promise';
import {observable, computed, action} from '@xh/hoist/mobx';
import {throwIf} from '@xh/hoist/utils/js';
import {isEqual} from 'lodash';

import {RestControlModel} from './RestControlModel';

@HoistModel()
export class RestFormModel {

    parent = null;
    controlModels = [];

    // If not null, form will be open and display it
    @observable record = null;
    originalRecord = null;

    get actionWarning() {return this.parent.actionWarning}
    get actionEnabled() {return this.parent.actionEnabled}
    get store()         {return this.parent.store}
    get fields()        {return this.store.fields}
    get loadModel()     {return this.store.loadModel}

    @computed
    get isAdd() {
        const rec = this.record;
        return (rec && rec.id === null);
    }

    @computed
    get isValid() {
        return this.controlModels.every(it => it.isValid);
    }

    @computed
    get isWritable() {
        const {isAdd, actionEnabled} = this;
        return (isAdd && actionEnabled.add) || (!isAdd && actionEnabled.edit);
    }

    @computed
    get isDirty() {
        return !isEqual(this.record, this.originalRecord);
    }

    constructor({parent, editors}) {
        this.parent = parent;
        this.controlModels = editors.map((editor) => {
            const field = this.store.getField(editor.field);
            throwIf(!field, `Unknown field '${editor.field}' in RestGrid.`);

            return new RestControlModel({editor, field, parent: this});
        });
    }

    //-----------------
    // Actions
    //-----------------
    @action
    saveRecord() {
        const {isAdd, record, store} = this;
        start(() => {
            return isAdd ? store.addRecordAsync(record) : store.saveRecordAsync(record);
        }).then(
            () => this.close()
        ).catchDefault();
    }

    @action
    deleteRecord() {
        this.store
            .deleteRecordAsync(this.record)
            .then(() => this.close())
            .catchDefault();
    }

    @action
    close() {
        this.originalRecord = this.record = null;
    }

    @action
    openAdd() {
        const newRec = {id: null};
        this.fields.forEach(f => {
            newRec[f.name] = f.defaultValue;
        });

        this.originalRecord = this.record = newRec;
    }

    @action
    openEdit(rec)  {
        this.originalRecord = this.record = Object.assign({}, rec);
    }

    @action
    setValue = (field, value) => {
        this.record[field] = value;
    }

    destroy() {
        XH.safeDestroy(...this.controlModels);
    }
}