/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {frame, viewport} from '@xh/hoist/cmp/layout';
import {elem, hoistCmp, uses} from '@xh/hoist/core';
import {refreshContextView} from '@xh/hoist/core/refresh';
import {StoreContextMenu} from '@xh/hoist/desktop/cmp/contextmenu';
import {dockContainerImpl} from '@xh/hoist/desktop/cmp/dock/impl/DockContainer';
import {colChooserDialog as colChooser, ColChooserModel} from '@xh/hoist/desktop/cmp/grid';
import {mask} from '@xh/hoist/desktop/cmp/mask';

import {tabContainerImpl} from '@xh/hoist/desktop/cmp/tab/impl/TabContainer';
import {installDesktopImpls} from '@xh/hoist/dynamics/desktop';
import {useOnMount} from '@xh/hoist/utils/react';
import {ChildContainerModel} from '../../../appcontainer/child/ChildContainerModel';
import {ChildState} from '../../../appcontainer/child/ChildState';
import {fragment, vframe} from '../../../cmp/layout';
import {errorBoundary} from '../../../core/impl';
import {exceptionDialog} from '../ExceptionDialog';
import {messageSource} from '../MessageSource';
import {toastSource} from '../ToastSource';
import {versionBar} from '../VersionBar';

installDesktopImpls({
    tabContainerImpl,
    dockContainerImpl,
    colChooser,
    ColChooserModel,
    StoreContextMenu
});

export const ChildContainer = hoistCmp({
    displayName: 'ChildContainer',
    model: uses(ChildContainerModel),

    render({model}) {
        useOnMount(() => {
            model.initAsync();
        });

        return fragment(
            errorBoundary({
                item: childContainerView(),
                onError: (e) => model.handleException(e, {requireReload: true})
            }),

            // TODO: Special handling for small windows
            exceptionDialog()
        );
    }
});

//-----------------------------------------
// Implementation
//-----------------------------------------
const childContainerView = hoistCmp.factory({
    displayName: 'ChildContainerView',

    render({model}) {
        const S = ChildState,
            state = model.childState;
        switch (state) {
            case S.INITIALIZING:
                return viewport(mask({isDisplayed: true, spinner: true}));
            case S.RUNNING:
            case S.SUSPENDED:
                return viewport(
                    vframe(
                        refreshContextView({
                            model: model.refreshContextModel,
                            item: frame(elem(model.childSpec.component, {model: model.childModel}))
                        }),
                        versionBar()
                    ),
                    messageSource(),
                    toastSource(),

                    // TODO: Better component
                    mask({isDisplayed: state === S.SUSPENDED})
                );
            default:
                return null;
        }
    }
});