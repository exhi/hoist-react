/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {isFunction} from 'lodash';
import {autorun, reaction} from '@xh/hoist/mobx';
import {provideMethods, chainMethods} from '@xh/hoist/utils/ClassUtils';

/**
 * Mixin to add MobX reactivity to Components, Models, and Services.
 *
 * Provides support for adding and removing 'managed' autoruns and reactions. The artifacts
 * created by these methods will be disposed of automatically when the owning object is destroyed,
 * ensuring that they do not block garbage collection.
 *
 * See https://mobx.js.org/refguide/api.html for full details on the underlying MobX APIs.
 */
export function Reactive(C) {

    C.isReactive = true;

    provideMethods(C, {

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
         * @param {(Object|function)} conf - function to run, or a config object containing options
         *      accepted by MobX autorun() API as well as argument below.
         * @param {function} [conf.run] - function to run - first arg to underlying autorun() call.
         */
        addAutorun(conf) {
            let run, options;
            if (isFunction(conf)) {
                run = conf;
                options = {};
            } else {
                ({run, ...options} = conf);
            }
            run = run.bind(this);
            this.addMobxDisposer(autorun(run, options));
        },


        /**
         * Add and start a managed reaction.
         *
         * A reaction's run function will be executed on changes to any/all observables read in its
         * track function, regardless of whether they - or any other observables - are accessed in
         * the run function. The reaction will also run only when the output of the track function
         * changes, and this output is passed to the run function.
         *
         * Choose a reaction over an autorun when you wish to explicitly declare which observables
         * should be tracked. A common pattern is to have the track function return these
         * observables in a simple array or object, which the run function can use as its input or
         * (commonly) ignore. This helps to clarify that the track function is only enumerating
         * the observables to be watched, and not necessarily generating or transforming values.
         *
         * @param {Object} conf - configuration of reaction, containing options accepted by MobX
         *      reaction() API, as well as arguments below.
         * @param {function} conf.track - function returning data to track - first arg to the
         *      underlying reaction() call.
         * @param {function} conf.run - function to run - second arg to underlying reaction() call.
         */
        addReaction(conf) {
            let {track, run, ...options} = conf;
            run = run.bind(this);
            this.addMobxDisposer(reaction(track, run, options));
        },


        //------------------------
        // Implementation
        //------------------------
        addMobxDisposer(disposer) {
            this._disposers = this._disposers || [];
            this._disposers.push(disposer);
        }
    });

    chainMethods(C, {
        /**
         * Destroy all MobX autoruns and reactions.
         */
        destroy() {
            if (this._disposers) {
                this._disposers.forEach(f => f());
                this._disposers = null;
            }
        }
    });

    return C;
}
