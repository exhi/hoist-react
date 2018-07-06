/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {HoistModel} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import createRouter from 'router5';
import browserPlugin from 'router5/plugins/browser';

/**
 * Top-level model for managing routing in hoist.
 *
 * This observable model uses router5 to manage the underlying routes,
 * presenting them to the application as a set of mobx observables.
 */
@HoistModel()
export class RouterModel {

    /**
     * Router5 state object representing the current state.
     */
    @observable currentState;

    /**
     * Underlying Router5 Router object implementing the routing state.
     */
    router = this.createRouter();

    /**
     * Does the routing system already have a given route?
     * @param {String} routeName
     */
    hasRoute(routeName) {
        const flatNames = this.getRouteNames(this.router.rootNode);
        return flatNames.includes(routeName);
    }

    /**
     * Navigate
     *
     * This is a convenience short cut for router.navigate().  See
     * the Router5 documentation for more information.
     */
    navigate(...args) {
        this.router.navigate(...args);
    }

    //-------------------------
    // Implementation
    //-------------------------
    @action
    setCurrentState(state) {
        this.currentState = state;
    }

    getRouteNames(node) {
        const name = node.name,
            ret = [];
        node.children.forEach(child => {
            this.getRouteNames(child).forEach(it => {
                ret.push(name ? name + '.' + it : it);
            })
        })
        if (name) ret.push(name);
        return ret;
    }

    createRouter() {
        const ret = createRouter([], {defaultRoute: 'default'});

        ret.usePlugin(browserPlugin())
            .subscribe(ev => this.setCurrentState(ev.route));

        return ret;
    }
}