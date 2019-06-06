/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {defaults} from 'lodash';
import {observable, action} from '@xh/hoist/mobx';
import {HoistModel, managed} from '@xh/hoist/core';

import {MessageModel} from './MessageModel';

/**
 *  Supports displaying Modal Dialogs.
 *
 *  @private
 */
@HoistModel
export class MessageSourceModel {

    @managed
    @observable.ref
    msgModels = [];

    message(config) {
        const ret = new MessageModel(config);
        this.addModel(ret);
        return ret.result;
    }

    alert(config) {
        config = defaults({}, config, {confirmText: 'OK'});
        return this.message(config);
    }

    confirm(config) {
        config = defaults({}, config, {confirmText: 'OK', cancelText: 'Cancel'});
        return this.message(config);
    }

    prompt(config) {
        config = defaults({}, config, {confirmText: 'OK', cancelText: 'Cancel', input: true});
        return this.message(config);
    }

    //-----------------------------------
    // Implementation
    //------------------------------------
    @action
    addModel(model) {
        this.msgModels.push(model);
        this.cull();
    }

    @action
    cull() {
        const models = this.msgModels,
            keepModels = models.filter(it => it.isOpen),
            cullModels = models.filter(it => !it.isOpen);

        this.msgModels = keepModels;
        cullModels.forEach(it => it.destroy());
    }
}