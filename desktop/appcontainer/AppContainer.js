/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {AppContainerModel} from '@xh/hoist/appcontainer/AppContainerModel';
import {fragment, frame, vframe, viewport} from '@xh/hoist/cmp/layout';
import {AppState, elem, hoistCmp, uses, XH} from '@xh/hoist/core';
import {errorBoundary} from '@xh/hoist/core/impl';
import {refreshContextView} from '@xh/hoist/core/refresh';
import {StoreContextMenu} from '@xh/hoist/desktop/cmp/contextmenu';
import {dockContainerImpl} from '@xh/hoist/desktop/cmp/dock/impl/DockContainer';
import {colChooserDialog as colChooser, ColChooserModel} from '@xh/hoist/desktop/cmp/grid';
import {mask} from '@xh/hoist/desktop/cmp/mask';

import {tabContainerImpl} from '@xh/hoist/desktop/cmp/tab/impl/TabContainer';
import {installDesktopImpls} from '@xh/hoist/dynamics/desktop';
import {useOnMount} from '@xh/hoist/utils/react';

import {aboutDialog} from './AboutDialog';
import {exceptionDialog} from './ExceptionDialog';
import {feedbackDialog} from './FeedbackDialog';
import {IdleDialog} from './IdleDialog';
import {impersonationBar} from './ImpersonationBar';
import {lockoutPanel} from './LockoutPanel';
import {loginPanel} from './LoginPanel';
import {messageSource} from './MessageSource';
import {optionsDialog} from './OptionsDialog';
import {toastSource} from './ToastSource';
import {updateBar} from './UpdateBar';
import {versionBar} from './VersionBar';

installDesktopImpls({
    tabContainerImpl,
    dockContainerImpl,
    colChooser,
    ColChooserModel,
    StoreContextMenu
});
/**
 * Top-level wrapper for Desktop applications.
 *
 * This class provide core Hoist Application layout and infrastructure to an application's
 * root Component. Provides a standard viewport that includes standard UI elements such as an
 * impersonation bar header, version bar footer, an app-wide load mask, a base context menu,
 * popup message support, and exception rendering.
 *
 * This component will kick off the Hoist application lifecycle when mounted.
 */
export const AppContainer = hoistCmp({
    displayName: 'AppContainer',
    model: uses(AppContainerModel),

    render({model}) {

        useOnMount(() => model.initAsync());

        return fragment(
            errorBoundary({
                item: appContainerView(),
                onError: (e) => model.handleException(e, {requireReload: true})
            }),
            exceptionDialog()
        );
    }
});


//-----------------------------------------
// Implementation
//-----------------------------------------
const appContainerView = hoistCmp.factory({
    displayName: 'AppContainerView',

    render({model}) {
        const S = AppState;
        switch (model.appState) {
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
                            item: frame(elem(model.appSpec.component, {model: model.appModel}))
                        }),
                        versionBar()
                    ),
                    mask({model: model.appLoadModel, spinner: true}),
                    messageSource(),
                    toastSource(),
                    optionsDialog(),
                    feedbackDialog(),
                    aboutDialog(),
                    idleDialog()
                );
            default:
                return null;
        }
    }
});

const idleDialog = hoistCmp.factory({
    displayName: 'IdleDialog',
    render({model}) {
        const dialogClass = model.appSpec.idleDialogClass || IdleDialog;

        return model.appState === AppState.SUSPENDED && dialogClass ?
            elem(dialogClass, {onReactivate: () => XH.reloadApp()}) :
            null;
    }
});
