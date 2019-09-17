/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {observable, runInAction} from '@xh/hoist/mobx';
import {HoistComponent, elemFactory, elem, AppState, XH} from '@xh/hoist/core';
import {refreshContextView} from '@xh/hoist/core/refresh';
import {mask} from '@xh/hoist/desktop/cmp/mask';
import {div, frame, viewport} from '@xh/hoist/cmp/layout';

import {AppContainerModel} from '@xh/hoist/appcontainer/AppContainerModel';


import {tabContainerImpl} from '@xh/hoist/desktop/cmp/tab/impl/TabContainer';
import {dockContainerImpl} from '@xh/hoist/desktop/cmp/dock/impl/DockContainer';
import {StoreContextMenu} from '@xh/hoist/desktop/cmp/contextmenu';
import {colChooserDialog as colChooser, ColChooserModel} from '@xh/hoist/desktop/cmp/grid';
import {installDesktopImpls} from '@xh/hoist/dynamics/desktop';

installDesktopImpls({
    tabContainerImpl,
    dockContainerImpl,
    colChooser,
    ColChooserModel,
    StoreContextMenu
});

@HoistComponent
export class ChildWindowAppContainer extends Component {

    // TODO: Special container model class for child windows
    static modelClass = AppContainerModel;

    @observable.ref caughtException = null;

    constructor() {
        super();

        // TODO: "lite" init?
        XH.initAsync();
    }

    render() {
        return div(
            this.renderContent()
        );
    }

    renderContent() {
        const {model} = this;
        const S = AppState;
        if (this.caughtException) return null;

        if (XH.appState === S.RUNNING) {
            return viewport(
                refreshContextView({
                    model: model.refreshContextModel,
                    item: frame(elem(XH.appSpec.componentClass, {model: XH.appModel}))
                }),
                mask({model: model.appLoadModel, spinner: true})
            );
        }

        return viewport(mask({isDisplayed: true, spinner: true}));
    }

    componentDidCatch(e, info) {
        runInAction(() => this.caughtException = e);
        XH.handleException(e, {requireReload: true});
    }
}

export const childWindowAppContainer = elemFactory(ChildWindowAppContainer);
