/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {XH} from 'hoist/core';
import {isFunction, isNumber, castArray} from 'lodash';
import RSVP from 'rsvp';

/**
 * Start a new promise chain.
 *
 * This method serves as a lightweight way to start a promise chain for any code.
 * It is useful for combining promise based calls with non-promise based calls, especially when
 * the first step may be synchronous.  In these case, we often want to ensure the use of common
 * exception, tracking, state management within a single promise chain.
 *
 * Note: This method will start executing its input function only after a minimal (1ms) delay.
 * This establishes a minimal level of asynchronicity for the entire chain, and is especially
 * important if the chain contains calls to 'bind', 'track' or 'timeout'
 *
 * @param {function} [fn=null] - function appropriate as an argument to `then()`.
 * @returns {Promise}
 */
export async function start(fn) {
    const promise = new Promise(resolve => setTimeout(resolve, 1));
    return fn ? promise.then(fn) : start;
}

/**
 * Return a promise that will resolve after the specified amount of time.
 *
 * @param {number} interval - milliseconds to delay.
 * @return {Promise}
 */
export async function wait(interval) {
    return new Promise(resolve => setTimeout(resolve, interval));
}

/**
 * Return a promise that resolves immediately.
 *
 * @param {*} value - the value to be returned by the resulting Promise.
 * @return {Promise}
 */
export async function resolve(value) {
    return Promise.resolve(value);
}

/**
 * Return a promise that never resolves.
 *
 * @return {Promise}
 */
export async function never() {
    return new Promise(() => {});
}

/**
 * Resolve when all promises are settled.
 * Inspired and implemented by RSVP.allSettled, but returns a native Promise.
 *
 * @param {Promise[]} promises
 * @returns {Array} - Array of Promise results, each of form
 *      {state: 'fulfilled'||'rejected', reason: exception||null, value: value||null}
 */
export async function allSettled(promises) {
    return new Promise((resolve, reject) => {
        RSVP.allSettled(promises).then(it => resolve(it), it => reject(it));
    });
}


//--------------------------------
// Promise prototype extensions
//--------------------------------
Object.assign(Promise.prototype, {

    /**
     * Version of catch() that will only catch certain exceptions.
     * @see Promise.catch()
     *
     * @param {function} selector - closure that takes an exception and returns a boolean.
     *      May also be specified as a list of exceptions names to be handled.
     *      Only exceptions passing this selector will be handled by this method.
     * @param {function} [fn]
     */
    catchWhen(selector, fn) {
        return this.catch(e => {
            this.throwIfFailsSelector(e, selector);
            return fn ? fn(e) : undefined;
        });
    },

    /**
     * Version of catch() that will invoke default application exception handling.
     * Typically called in last line in promise chain.
     *
     * @param {Object} [options]
     * @param {string} [options.title]
     * @param {string} [options.message]
     */
    catchDefault(options) {
        return this.catch(e => XH.handleException(e, options));
    },

    /**
     * Version of catchDefault() that will only catch certain exceptions.
     *
     * @param {function} selector - see catchWhen().
     * @param {Object} [options]
     * @param {string} [options.title]
     * @param {string} [options.message]
     */
    catchDefaultWhen(selector, options) {
        return this.catch(e => {
            this.throwIfFailsSelector(e, selector);
            return XH.handleException(e, options);
        });
    },

    /**
     * Track a Promise.
     * @see TrackService.track()
     *
     * @param {Object} [trackCfg] - valid options object for TrackService.track().
     *      If null, no tracking will be performed (useful when trackCfg conditionally generated -
     *      i.e. to suppress tracking for auto-refresh calls triggered by a Timer).
     */
    track(trackCfg) {
        if (!trackCfg) return this;

        const startTime = Date.now();

        return this.catch(e => {
            throw e;
        }).finally(() => {
            trackCfg.elapsed = Date.now() - startTime;
            XH.track(trackCfg);
        });
    },

    /**
     * Wait on a potentially async function, before passing the originally received value through.
     * Useful when we want to block and do something on the promise chain, but do not want to
     * manipulate the values being passed through.
     *
     * @param {function} onFulfillment - function to receive the pass-through value when ready.
     */
    tap(onFulfillment) {
        let ret = null;
        const resolveFn = (data) => {
            ret = data;
            return onFulfillment(data);
        };

        return this
            .then(resolveFn)
            .then(() => ret);
    },

    /**
     * Return a promise that will resolve a specified delay after this promise resolves.
     *
     * @param {number} interval - delay in milliseconds.
     */
    wait(interval) {
        return this.finally(() => wait(interval));
    },

    /**
     * Return a promise that will reject if this promise has not been settled after the specified
     * interval has passed.
     *
     * @param {(Object|number)} [config] - object as per below, or interval in ms (if number).
     *      If null, no timeout enforced.
     * @param {number} [config.interval] - interval value in ms.
     * @param {string} [config.message] - message for Exception thrown on timeout.
     */
    timeout(config) {
        if (config == null) return this;
        if (isNumber(config)) config = {interval: config};
        config.message = config.message || 'Operation timed out';

        let completed = false;
        const promise = this.finally(() => completed = true);

        const deadline = wait(config.interval).then(() => {
            if (!completed) throw XH.exception(config.message);
        });

        return Promise.race([deadline, promise]);
    },


    /**
     * Link this promise to an instance of PromiseModel.
     *
     * @param {(LastPromiseModel|MultiPromiseModel)} model
     */
    linkTo(model) {
        model.link(this);
        return this;
    },


    //--------------------------------
    // Implementation
    //--------------------------------
    throwIfFailsSelector(e, selector) {
        const fn = isFunction(selector) ? selector : (e) => castArray(selector).includes(e.name);
        if (!fn(e)) throw e;
    }
});