/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {action} from 'hoist/mobx';
import {GridModel} from 'hoist/grid';
import {MessageModel} from 'hoist/cmp';
import {GridContextMenu} from 'hoist/grid';
import {pluralize} from 'hoist/utils/JsUtils';

import {RestFormModel} from './RestFormModel';

/**
 * Core Model for a RestGrid.
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

    unit = null
    filterFields = null

    gridModel = null;
    formModel = null;
    messageModel = new MessageModel({title: 'Warning', icon: 'warning-sign'});

    get store()     {return this.gridModel.store}
    get selection() {return this.gridModel.selection}

    /**
     * Construct this Object.
     *
     * @param actionEnabled, map of action (e.g. 'add'/'edit'/'delete') to boolean  See default prop
     * @param actionWarning, map of action (e.g. 'add'/'edit'/'delete') to string.  See default prop.
     * @param unit, string describing the name records in this grid
     * @param filterFields, array of strings, names of fields to include in this grid's quick filter logic
     * @param editors, array of editors
     * @param rest, arguments for GridModel.
     */
    constructor({
        actionEnabled,
        actionWarning,
        unit,
        filterFields,
        editors = [],
        ...rest
    }) {
        this.actionEnabled = Object.assign(this.actionEnabled, actionEnabled);
        this.actionWarning = Object.assign(this.actionWarning, actionWarning);
        this.unit = unit;
        this.filterFields = filterFields;
        this.gridModel = new GridModel({contextMenuFn: this.contextMenuFn, ...rest});
        this.formModel = new RestFormModel({parent: this, editors});
    }


    //-----------------
    // Actions
    //------------------
    @action
    addRecord() {
        this.formModel.openAdd();
    }

    @action
    deleteSelection() {
        const record = this.selection.singleRecord;
        if (record) this.deleteRecord(record);
    }

    @action
    deleteRecord(record) {
        this.store.deleteRecordAsync(record).catchDefault();
    }

    @action
    editSelection() {
        const record = this.selection.singleRecord;
        if (record) this.editRecord(record);
    }

    @action
    editRecord(record) {
        this.formModel.openEdit(record);
    }

    contextMenuFn = () => {
        return new GridContextMenu([
            {
                text: 'Add',
                action: () => this.addRecord()
            },
            {
                text: 'Edit',
                action: (item, record) => this.editRecord(record),
                recordsRequired: 1
            },
            {
                text: 'Delete',
                action: (item, record) => this.confirmDeleteRecord(record),
                recordsRequired: true
            },
            '-',
            'copy',
            'copyWithHeaders',
            '-',
            'export',
            'autoSizeAll'
        ]);
    }

    confirmDeleteSelection() {
        const record = this.selection.singleRecord;
        if (record) this.confirmDeleteRecord(record);
    }

    confirmDeleteRecord(record) {
        const warning = this.actionWarning.del;
        if (warning) {
            this.messageModel.confirm({
                message: warning,
                onConfirm: () => this.deleteRecord(record)
            });
        } else {
            this.deleteRecord(record);
        }
    }

    exportGrid = () => {
        const unit = this.unit || 'record',
            fileName = pluralize(unit);
        this.gridModel.exportDataAsExcel({fileName});
    }
}