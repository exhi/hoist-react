/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {elem, elemFactory, HoistComponent} from '@xh/hoist/core';
import {div, hbox, vbox, span, filler} from '@xh/hoist/cmp/layout';
import {dialog} from '@xh/hoist/kit/blueprint';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {isReactElement} from '@xh/hoist/utils/react';
import {DockViewModel} from '@xh/hoist/cmp/dock';

import './Dock.scss';

/**
 * Wrapper for contents to be shown within a DockContainer.
 *
 * @private
 */
@HoistComponent
export class DockView extends Component {

    static modelClass = DockViewModel;

    static propTypes = {
        model: PT.oneOfType([PT.instanceOf(DockViewModel), PT.object]).isRequired
    };

    baseClassName = 'xh-dock-view';

    render() {
        const {model} = this;
        return model.collapsed || model.docked ? this.renderInDock() : this.renderInDialog();
    }

    renderInDock() {
        const {collapsed} = this.model;

        return vbox({
            className: this.getClassName(collapsed ? 'xh-dock-view--collapsed' : null),
            items: [
                this.renderHeader(),
                this.renderBody()
            ]
        });
    }

    renderInDialog() {
        return dialog({
            className: this.getClassName('xh-dock-view--dialog'),
            isOpen: true,
            onClose: () => this.onClose(),
            canOutsideClickClose: false,
            transitionName: 'none',
            transitionDuration: 0,
            items: [
                this.renderHeader(),
                this.renderBody()
            ]
        });
    }

    renderHeader() {
        const {icon, title, collapsed, docked, allowClose, allowDialog} = this.model;

        return hbox({
            className: 'xh-dock-view__header',
            items: [
                span({
                    omit: !icon,
                    item: icon,
                    className: 'xh-dock-view__header__icon',
                    onDoubleClick: () => this.onToggleCollapsed()
                }),
                span({
                    omit: !title,
                    item: title,
                    className: 'xh-dock-view__header__title',
                    onDoubleClick: () => this.onToggleCollapsed()
                }),
                filler(),
                button({
                    icon: collapsed ? Icon.angleUp() : Icon.angleDown(),
                    onClick: () => this.onToggleCollapsed()
                }),
                button({
                    omit: collapsed || !allowDialog,
                    icon: docked ? Icon.expand() : Icon.collapse(),
                    onClick: () => this.onToggleDocked()
                }),
                button({
                    omit: !allowClose,
                    icon: Icon.close(),
                    onClick: () => this.onClose()
                })
            ]
        });
    }

    renderBody() {
        return div({
            className: 'xh-dock-view__body',
            item: this.renderContent()
        });
    }

    renderContent() {
        const {content} = this.model;
        if (isReactElement(content)) return content;
        if (content.prototype.render) return elem(content);
        return content();
    }

    onToggleDocked() {
        this.model.toggleDocked();
    }

    onToggleCollapsed() {
        this.model.toggleCollapsed();
    }

    onClose() {
        this.model.close();
    }

}

export const dockView = elemFactory(DockView);