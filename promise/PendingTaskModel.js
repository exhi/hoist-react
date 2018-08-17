/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {isUndefined} from 'lodash';

/**
 * Tracks the resolution state of a stream of promise invocations.
 *
 * An instance of this class can easily be bound to promise chains,
 * and then used as a model for masks or other UI elements that need
 * to track the progression of asynchronous tasks.
 */
export class PendingTaskModel {

    @observable message = null;
    @action setMessage(v) {this.message = v}

    mode = null;

    @observable _pendingCount = 0;
    @observable _lastCall = null;

    /**
     * @param {string} [mode] - behavior with respect to multiple linked promises.
     *      'all' to track all linked promises, 'last' to track the last linked promise only.
     * @param {?string} [message] - Optional string describing the nature of the pending
     *      task. For end-user display.
     */
    constructor({mode = 'last', message = null} = {}) {
        this.mode = mode;
        this.message = message;
    }

    /**
     * Are the bound promise/promises still pending?
     *
     * This observable property is the main public entry point for this object.
     * It's behavior depends on the 'type' property.
     */
    get isPending() {
        return this.mode === 'all' ? this.anyPending : this.lastPending;
    }

    /**
     * Link this model to a promise.
     *
     * Not typically called directly by applications.  Applications should call Promise.link() instead.
     *
     * @param {Promise} promise
     * @param {?string} [message]
     */
    @action
    link(promise, message) {
        this._pendingCount++;
        this._lastCall = promise;
        promise.finally(() => this.onComplete(promise));
        if (!isUndefined(message)) this.message = message;
    }

    //-----------------------------
    // Implementation
    //-----------------------------
    get anyPending() {
        return this._pendingCount > 0;
    }

    get lastPending() {
        return this._lastCall != null;
    }

    @action
    onComplete(promise) {
        if (this._pendingCount)          this._pendingCount--;
        if (promise === this._lastCall)  this._lastCall = null;
    }
}