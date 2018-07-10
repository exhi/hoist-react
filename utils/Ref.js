/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {observable, action} from '@xh/hoist/mobx';

/**
 * Shorthand object for creating an observable ref, supporting reactive
 * monitoring of a child element through re-renders.
 *
 * https://reactjs.org/docs/refs-and-the-dom.html
 */
export class Ref {

    /**
     * Component or element of interest.
     *
     * Will be set to a reference when the associated component is mounted
     * and reverted back to null when it is is unmounted.
     */
    @observable
    value = null;

    /**
     * Callback for React's 'ref' property.
     *
     * Connect a Component to this object by specifying this callback as
     * the Component's `ref` prop.
     */
    @action
    ref = (v) => this.value = v;
}