/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, XH, managed} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {FormModel, required} from '@xh/hoist/cmp/form';
import {isPlainObject} from 'lodash';

/**
 * Model for a single instance of a modal dialog.
 *
 * @private
 */
@HoistModel
export class MessageModel {

    // Immutable properties
    title = null;
    icon = null;
    message = null;
    input = null;
    confirmText = null;
    cancelText = null;
    confirmIntent = null;
    cancelIntent = null;
    onConfirm = null;
    onCancel = null;

    // Promise to be resolved when user has clicked on choice and its internal resolver
    result = null;
    _resolver = null;

    @observable isOpen = true;

    @managed
    formModel = new FormModel({
        fields: [{
            name: 'value',
            rules: [required]
        }]
    });

    constructor(config) {
        this.title = config.title;
        this.icon = config.icon;
        this.message = config.message;
        this.input = config.input;
        this.confirmText = config.confirmText;
        this.cancelText = config.cancelText;
        this.confirmIntent = config.confirmIntent;
        this.cancelIntent = config.cancelIntent;
        this.onConfirm = config.onConfirm;
        this.onCancel = config.onCancel;
        this.result = new Promise(resolve => this._resolver = resolve);

        // Extract properties from input
        if (isPlainObject(this.input)) {
            const {value, rules} = this.input;
            if (value) this.formModel.init({value});
            if (rules) this.formModel.fields.value.setRules(rules);
        }

        // Message modals are automatically dismissed on app route changes to avoid navigating the
        // app underneath the dialog in an unsettling way.
        this.addReaction({
            track: () => XH.routerState,
            run: () => this.close()
        });
    }

    @action
    doConfirm() {
        if (this.input) {
            this.doSubmitAsync();
        } else {
            if (this.onConfirm) this.onConfirm();
            this._resolver(true);
            this.close();
        }
    }

    @action
    doCancel() {
        if (this.onCancel) this.onCancel();
        this._resolver(false);
        this.close();
    }

    //-----------------------
    // Implementation
    //-----------------------
    async doSubmitAsync() {
        await this.formModel.validateAsync();
        if (!this.formModel.isValid) return;

        if (this.onConfirm) this.onConfirm();
        this._resolver(this.formModel.getData().value);
        this.close();
    }

    @action
    close() {
        this.isOpen = false;
    }

    destroy() {
        this.close();
    }
}

/**
 * @typedef {Object} MessageInput
 * @property {HoistInput} [item] - HoistInput to use.
 * @property {Rule[]} [rules] - validation constraints to apply.
 * @property {*} [initialValue] - initial value for the input.
 */