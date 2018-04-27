/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {autorun, observer} from 'hoist/mobx';
import {ContextMenuTarget, HotkeysTarget} from 'hoist/kit/blueprint';
import {addProperty, mixinMethods} from 'hoist/utils/MixinUtils';

import {XH} from './XH';
import {elemFactory} from './elem';

/**
 * Core Decorator for Components in Hoist.
 */
export function hoistComponent({isObserver = true} = {}) {

    return function(C) {
        const proto = C.prototype;

        //--------------------------------------------------------------------
        // Convenience Getters.
        //---------------------------------------------------------------------
        addProperty(C, 'darkTheme', {
            get() {return XH.darkTheme}
        });

        addProperty(C, 'model', {
            get() {return this.localModel ? this.localModel : this.props.model}
        });

        //-------------------------------------------------------
        // Decorate with Blueprint Context Menu, HotKeys support
        //-------------------------------------------------------
        if (proto.renderContextMenu) {
            C = ContextMenuTarget(C);
        }

        if (proto.renderHotkeys) {
            C = HotkeysTarget(C);
        }

        //------------------------------
        // Support for renderCollapsed
        //------------------------------
        const render = proto['render'],
            renderCollapsed = proto.renderCollapsed;
        proto.render = function() {
            return this.props.isCollapsed === true ?
                (renderCollapsed ? renderCollapsed.apply(this, arguments) : null):
                (render ? render.apply(this, arguments) : null);
        };

        //---------------------------------------------------------
        // Mobx -- add observer and support for managed auto runs
        //---------------------------------------------------------
        if (isObserver) {
            C = observer(C);
        }

        mixinMethods(C, {
            addAutoRun: function(...autoRunArgs) {
                this.xhAutoRuns = this.xhAutoRuns || [];
                this.xhAutoRuns.push(autoRunArgs);
            },

            componentDidMount: function() {
                const {xhAutoRuns} = this;
                if (xhAutoRuns) {
                    xhAutoRuns.forEach(args => {
                        this.xhDisposers = this.xhDisposers || [];
                        this.xhDisposers.push(autorun(...args));
                    });
                }
            },

            componentWillUnmount: function() {
                const {xhDisposers} = this;
                if (xhDisposers) {
                    xhDisposers.forEach(f => f());
                    this.xhDisposers = null;
                }
            }
        });

        C.isHoistComponent = true;
        return C;
    };
}

/**
 * Create an elementFactory for a HoistComponent.
 */
export function hoistComponentFactory(C, hcArgs = {}) {
    return elemFactory(hoistComponent(hcArgs)(C));
}