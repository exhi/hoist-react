/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import ReactDom from 'react-dom';
import {XH} from '@xh/hoist/core';
import {observer} from '@xh/hoist/mobx';
import {defaultMethods, chainMethods, overrideMethods} from '@xh/hoist/utils/ClassUtils';

import {ReactiveSupport} from './mixins/ReactiveSupport';
import {elemFactory} from './elem';

/**
 * Core decorator for Components in Hoist.
 *
 * All React Components in Hoist applications should typically be decorated with this decorator.
 * Exceptions include highly specific low-level components provided to other APIs which may be
 * negatively impacted by the overhead associated with this decorator.
 *
 * Adds support for managed events, mobx reactivity, model awareness, and other convenience getters.
 *
 * @param {Object} [config] - configuration for the decorator.
 * @param {boolean} [config.isReactive] - apply the ReactiveSupport and mobX Observer mixins to the component Class.
 * @param boolean [config.collapseSupport] - Does component support collapsing?  If true, the component
 *      should respond to a 'collapsed' property setting on it, and render itself appropriately.  See
 *      Panel for an example of this behavior.  If true, this component should support a "collapsed"
 *      property.
 */
export function HoistComponent({
    isReactive = true,
    collapseSupport = false
} = {}) {

    return (C) => {
        C.isHoistComponent = true;
        C.collapseSupport = collapseSupport;

        if (isReactive) {
            C = ReactiveSupport(C);
        }

        defaultMethods(C, {
            /**
             * Model class which this component is rendering.  This is a shortcut getter
             * for either a 'localModel' property on the component or a 'model' placed in props.
             */
            model: {
                get() {return this.localModel ? this.localModel : this.props.model}
            },

            /**
             * Should this component be displayed as collapsed on a given edge?
             *
             * Valid values include 'top', 'left', 'right', 'bottom', true or
             * false.  A value of true is considered equivalent to 'top'.
             *
             * This component should indicate support for this property by setting 'collapsibleSupport'
             * to true when defining this component.
             */
            collapsed: {
                get() {return this.props.collapsed}
            },


            /**
             * Is this component in the DOM and not within a hidden sub-tree (e.g. hidden tab).
             * Based on the underlying css 'display' property of all ancestor properties.
             */
            isDisplayed: {
                get() {
                    let elem = this.getDOMNode();
                    if (!elem) return false;
                    while (elem) {
                        if (elem.style.display == 'none') return false;
                        elem = elem.parentElement;
                    }
                    return true;
                }
            },

            /**
             * Get the DOM element underlying this component.
             * Returns null if component is not mounted.
             */
            getDOMNode() {
                return this._mounted ?
                    ReactDom.findDOMNode(this) :
                    null;
            }
        });


        //--------------------------
        // Implementation
        //--------------------------
        chainMethods(C, {
            componentDidMount() {
                this._mounted = true;
            },

            componentWillUnmount() {
                this._mounted = false;
                this.destroy();
            },

            destroy() {
                XH.safeDestroy(this.localModel);
            }
        });

        // This must be last, should provide the last override of render
        if (isReactive) {
            C = observer(C);
        }

        return C;
    };
}

/**
 * Create an elementFactory for a HoistComponent.
 */
export function hoistComponentFactory(C, hcArgs = {}) {
    return elemFactory(HoistComponent(hcArgs)(C));
}