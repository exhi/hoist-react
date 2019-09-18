/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {AppContainerModel} from '@xh/hoist/appcontainer/AppContainerModel';
import {frame, viewport} from '@xh/hoist/cmp/layout';
import {AppState, elem, XH} from '@xh/hoist/core';
import {refreshContextView} from '@xh/hoist/core/refresh';
import {StoreContextMenu} from '@xh/hoist/desktop/cmp/contextmenu';
import {dockContainerImpl} from '@xh/hoist/desktop/cmp/dock/impl/DockContainer';
import {colChooserDialog as colChooser, ColChooserModel} from '@xh/hoist/desktop/cmp/grid';
import {mask} from '@xh/hoist/desktop/cmp/mask';


import {tabContainerImpl} from '@xh/hoist/desktop/cmp/tab/impl/TabContainer';
import {installDesktopImpls} from '@xh/hoist/dynamics/desktop';
import {fragment, vframe} from '../../cmp/layout';
import {hoistCmp} from '../../core';
import {errorBoundary} from '../../core/impl';
import {uses} from '../../core/modelspec';
import {aboutDialog} from '../../desktop/appcontainer/AboutDialog';
import {exceptionDialog} from '../../desktop/appcontainer/ExceptionDialog';
import {impersonationBar} from '../../desktop/appcontainer/ImpersonationBar';
import {lockoutPanel} from '../../desktop/appcontainer/LockoutPanel';
import {loginPanel} from '../../desktop/appcontainer/LoginPanel';
import {messageSource} from '../../desktop/appcontainer/MessageSource';
import {toastSource} from '../../desktop/appcontainer/ToastSource';
import {updateBar} from '../../desktop/appcontainer/UpdateBar';
import {versionBar} from '../../desktop/appcontainer/VersionBar';
import {useOnMount} from '../../utils/react';

installDesktopImpls({
    tabContainerImpl,
    dockContainerImpl,
    colChooser,
    ColChooserModel,
    StoreContextMenu
});

export const ChildAppContainer = hoistCmp({
    displayName: 'ChildAppContainer',
    model: uses(AppContainerModel),

    render() {
        useOnMount(() => {
            // TODO: Get XH from our parent window?
        });

        return fragment(
            errorBoundary({
                item: childAppContainerView(),
                onError: (e) => XH.handleException(e, {requireReload: true})
            }),

            // TODO: Special handling for small openfin windows
            exceptionDialog()
        );
    }
});

//-----------------------------------------
// Implementation
//-----------------------------------------
const childAppContainerView = hoistCmp.factory({
    displayName: 'ChildAppContainerView',

    render({model}) {
        const S = AppState;
        switch (XH.appState) {
            case S.PRE_AUTH:
            case S.INITIALIZING:
                return viewport(mask({isDisplayed: true, spinner: true}));
            case S.LOGIN_REQUIRED:
                return loginPanel();
            case S.ACCESS_DENIED:
                return lockoutPanel();
            case S.LOAD_FAILED:
                return null;
            case S.RUNNING:
            case S.SUSPENDED:
                return viewport(
                    vframe(
                        impersonationBar(),
                        updateBar(),
                        refreshContextView({
                            model: model.refreshContextModel,
                            item: frame(elem(XH.appSpec.componentClass, {model: XH.appModel}))
                        }),
                        versionBar()
                    ),
                    mask({model: model.appLoadModel, spinner: true}),
                    messageSource(),
                    toastSource(),
                    aboutDialog(),

                    // TODO: Better component
                    mask({isDisplayed: XH.appState === S.SUSPENDED})
                );
            default:
                return null;
        }
    }
});