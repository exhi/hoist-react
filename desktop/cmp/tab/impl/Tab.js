/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {TabRenderMode} from '@xh/hoist/enums';
import {Component} from 'react';
import {elem, elemFactory, refreshContextView, HoistComponent} from '@xh/hoist/core';
import {frame} from '@xh/hoist/cmp/layout';
import {TabModel} from '../TabModel';

/**
 * @private
 *
 * Wrapper for contents to be shown within a TabContainer. This Component is used by TabContainer's
 * internal implementation to:
 *
 *   - Mount/unmount its contents according to `TabModel.renderMode`.
 *   - Track and trigger refreshes according to `TabModel.refreshMode`.
 *   - Stretch its contents using a flex layout.
 */
@HoistComponent
export class Tab extends Component {

    static modelClass = TabModel;
    baseClassName = 'xh-tab';

    wasActivated = false;

    render() {
        const {content, isActive, renderMode, refreshContextModel} = this.model;

        this.wasActivated = this.wasActivated || isActive;

        if (
            !isActive &&
            (
                (renderMode == TabRenderMode.UNMOUNT_ON_HIDE) ||
                (renderMode == TabRenderMode.LAZY && !this.wasActivated)
            )
        ) {
            return null;
        }

        const contentElem = content.prototype.render ? elem(content, {flex: 1}) : content({flex: 1});
        
        return frame({
            display: isActive ? 'flex' : 'none',
            className: this.getClassName(),
            item: refreshContextView({
                model: refreshContextModel,
                item: contentElem
            })
        });
    }
}
export const tab = elemFactory(Tab);
