/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {
    action,
    autorun as mobxAutorun,
    reaction as mobxReaction,
    when as mobxWhen
} from '@xh/hoist/mobx';
import {applyMixin, throwIf} from '@xh/hoist/utils/js';
import {
    debounce as lodashDebounce,
    isFunction,
    isNil,
    isNumber,
    isPlainObject,
    upperFirst
} from 'lodash';

/**
 * Mixin to add MobX reactivity to Components, Models, and Services.
 *
 * Provides support for adding and removing 'managed' autoruns and reactions. The artifacts
 * created by these methods will be disposed of automatically when the owning object is destroyed,
 * ensuring that they do not block garbage collection.
 *
 * See https://mobx.js.org/refguide/api.html for full details on the underlying MobX APIs.
 */
export function ReactiveSupport(C) {
    return applyMixin(C, {
        name: 'ReactiveSupport',

        provides: {

            /**
             * Add and start a managed autorun.
             *
             * An autorun function will be run on changes to any/all observables read during the last
             * execution of the function. This provides convenient and often very efficient dynamic
             * reactivity. This is a core MobX concept and is important to fully understand when
             * using autorun functions.
             *
             * In some cases, however, it is desirable or more clear to explicitly declare which
             * observables should be tracked and trigger a reaction, regardless of their use within
             * the function itself. See addReaction() below for that functionality.
             *
             * This autorun will be disposed of automatically when this object is destroyed. It can also be
             * ended/disposed of manually using the native mobx disposer function returned by this method.
             *
             * @param {(Object|function)} conf - function to run, or a config object containing options
             *      accepted by MobX autorun() API as well as argument below.
             * @param {function} [conf.run] - function to run - first arg to underlying autorun() call.
             * @param {(number|Object)} [conf.debounce] - Specify to debounce run function with lodash.
             *      When specified as Object, should contain an 'interval' and other optional keys for
             *      lodash debounce.  If specified as number the default lodash debounce will be used.
             * @returns {function} - disposer to manually dispose of the created autorun.
             */
            addAutorun(conf) {
                if (isFunction(conf)) conf = {run: conf};
                let {run, debounce, ...opts} = conf;

                this.validateMobxOptions(opts);
                run = this.bindAndDebounce(run, debounce);

                return this.addMobxDisposer(mobxAutorun(run, opts));
            },


            /**
             * Add and start a managed reaction.
             *
             * A reaction's run function will be executed on changes to any/all observables read in its
             * track function, regardless of whether they - or any other observables - are accessed in
             * the run function. The reaction will also run only when the output of the track function
             * changes, and this output is passed to the run function.
             *
             * Specify the property 'track' to run the reaction continuously until disposal.
             * Alternatively, specify the 'when' property to run this reaction only until the predicate
             * passes, and the run function is executed once. (These map to mobX's native `reaction()`
             * and `when()` functions, respectively).
             *
             * Choose this method over an autorun when you wish to explicitly declare which observables
             * should be tracked. A common pattern is to have the track function return these
             * observables in a simple array or object, which the run function can use as its input or
             * (commonly) ignore. This helps to clarify that the track function is only enumerating
             * the observables to be watched, and not necessarily generating or transforming values.
             *
             *  This reaction will be disposed of automatically when this object is destroyed. It can also be
             *  ended/disposed of manually using the native mobx disposer function returned by this method.
             *
             * @param {Object} conf - configuration of reaction, containing options accepted by MobX
             *      reaction() API, as well as arguments below.
             * @param {function} [conf.track] - function returning data to observe - first arg to the
             *      underlying reaction() call. Specify this or `when`.
             * @param {function} [conf.when] - function returning data to observe - first arg to the
             *      underlying when() call. Specify this or `track`.
             * @param {function} conf.run - function to run - second arg to underlying reaction()/when() call.
             * @param {(number|Object)} [conf.debounce] - Specify to debounce run function with lodash.
             *      When specified as object, should contain an 'interval' and other optional keys for
             *      lodash.  If specified as number the default lodash debounce will be used.
             * @returns {function} - disposer to manually dispose of the created reaction.
             */
            addReaction({track, when, run, debounce, ...opts}) {
                throwIf(
                    (track && when) || (!track && !when),
                    "Must specify either 'track' or 'when' in addReaction."
                );
                this.validateMobxOptions(opts);

                run = this.bindAndDebounce(run, debounce);

                return track ?
                    this.addMobxDisposer(mobxReaction(track, run, opts)):
                    this.addMobxDisposer(mobxWhen(when, run, opts));
            },

            /**
             * Set an observable/bindable value.
             *
             * This method is a convenience method for calling the conventional setXXX method
             * for updating a mobx observable given the property name.
             *
             * @param {string} property
             * @param {*} value
             */
            setBindable(property, value) {
                const setter = `set${upperFirst(property)}`;
                throwIf(!isFunction(this[setter]),
                    `Required function '${setter}()' not found on bound model. ` +
                    `Implement a setter, or use the @bindable annotation.`
                );
                this[setter].call(this, value);
            },

            /**
             * Delegate to static persistWith on this class.
             */
            persistWith: {
                get() {
                    return this.constructor.persistWith;
                }
            },


            //------------------------
            // Implementation
            //------------------------
            addMobxDisposer(disposer) {
                this._disposers = this._disposers || [];
                this._disposers.push(disposer);
                return disposer;
            },

            validateMobxOptions(options) {
                throwIf(
                    !isNil(options.runImmediately),
                    '"runImmediately" is not a reaction option.  Did you mean "fireImmediately"?'
                );
            },

            bindAndDebounce(fn, debounce) {
                let ret = fn.bind(this);

                //  See https://github.com/mobxjs/mobx/issues/1956 and note we cannot use mobx scheduler.
                //  ensure the async run of the effect also occurs in action as expected.
                if (isNumber(debounce)) return lodashDebounce(action(ret), debounce);
                if (isPlainObject(debounce)) return lodashDebounce(action(ret), debounce.interval, debounce);
                return ret;
            }
        },

        chains: {
            destroy() {
                if (this._disposers) {
                    this._disposers.forEach(f => f());
                    this._disposers = null;
                }
            }
        }
    });
}
