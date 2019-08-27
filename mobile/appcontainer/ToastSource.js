/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {head} from 'lodash';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {wait} from '@xh/hoist/promise';
import {toast} from './Toast';
import {ToastSourceModel} from '@xh/hoist/appcontainer/ToastSourceModel';

/**
 *  Support for popping global Toasts into the DOM.
 *
 *  This component uses a queue based approach, and will
 *  ensure only one toast is showing at a time.
 *
 *  @private
 */
@HoistComponent
export class ToastSource extends Component {

    static modelClass = ToastSourceModel;

    render() {
        const pending = this.model.toastModels.filter(it => it.isOpen),
            next = head(pending);

        if (!next) return null;

        if (!next.dismissIsPending) {
            wait(next.timeout).then(() => next.dismiss());
            next.dismissIsPending = true;
        }
        return toast({model: next, key: next.xhId});
    }
}
export const toastSource = elemFactory(ToastSource);