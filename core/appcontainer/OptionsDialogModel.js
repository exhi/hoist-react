/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {XH, HoistModel, managed} from '@xh/hoist/core';
import {FormModel} from '@xh/hoist/cmp/form';
import {PendingTaskModel} from '@xh/hoist/utils/async';
import {observable, computed, action} from '@xh/hoist/mobx';
import {allSettled} from '@xh/hoist/promise';
import {assign} from 'lodash';

import {AppOption} from './AppOption';

/**
 * Manages built-in setting of options.
 * @private
 */
@HoistModel
export class OptionsDialogModel {

    @observable isOpen = false;
    @observable.ref options = [];

    @managed
    loadModel = new PendingTaskModel();

    @managed
    formModel = null;

    init() {
        this.addReaction({
            track: () => XH.routerState,
            run: () => this.hide()
        });
    }

    //-------------------
    // Setting options
    //-------------------
    setOptions(options) {
        this.options = options.map(o => new AppOption(o));
        const fields = this.options.map(o => assign({name: o.name}, o.fieldModel));
        this.formModel = new FormModel({fields});
    }

    get hasOptions() {
        return !!this.options.length;
    }

    @computed
    get requiresRefresh() {
        const {formModel} = this;
        return formModel && this.options.some(o => formModel.fields[o.name].isDirty && o.refreshRequired);
    }

    //-------------------
    // Dialog
    //-------------------
    @action
    show() {
        this.isOpen = true;
        this.initAsync();
    }

    @action
    hide() {
        this.isOpen = false;
    }

    async initAsync() {
        const {formModel} = this;
        const promises = this.options.map(option => {
            return option.getValueAsync().then(v => formModel.fields[option.name].init(v));
        });
        await allSettled(promises).linkTo(this.loadModel);
    }

    async saveAsync() {
        await this.formModel.validateAsync();
        if (!this.formModel.isValid) return;

        const refresh = this.requiresRefresh;

        if (refresh) {
            this.loadModel.setMessage('Reloading app to apply changes...');
        }

        this.doSaveAsync()
            .wait(refresh ? 1500 : 1)
            .then(() => {
                this.hide();
                if (refresh) XH.reloadApp();
            })
            .linkTo(this.loadModel)
            .catchDefault();
    }

    async doSaveAsync() {
        const {formModel} = this;
        const promises = this.options.map(option => {
            return option.setValueAsync(option.name, formModel.values[option.name]);
        });
        await allSettled(promises);
        return XH.prefService.pushPendingAsync();
    }
}