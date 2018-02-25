/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import './HoistApp.css';

import {Component} from 'react';
import {elem, hocDisplayName} from 'hoist/react';
import {loadMask} from 'hoist/cmp';
import {contextMenu, ContextMenuTarget} from 'hoist/cmp/contextmenu';
import {errorDialog} from 'hoist/error';
import {frame, viewport, vframe} from 'hoist/layout';
import {observer} from 'hoist/mobx';

import {hoistAppModel} from './HoistAppModel';
import {loginPanel} from './cmp/LoginPanel';
import {impersonationBar} from './cmp/ImpersonationBar';
import {versionBar} from './cmp/VersionBar';
import {aboutDialog} from './cmp/AboutDialog';

/**
 * Host Component for a Hoist Application
 *
 * Provides initialized Hoist services and basic wrapper components
 * for a hoist application.
 */
export function hoistApp(C) {

    return (
        @ContextMenuTarget
        @observer
        class extends Component {

            static displayName = hocDisplayName('HoistApp', C);

            constructor() {
                // TODO:  Provide to app via Provider/inject mechanism rather than global import.
                super();
                hoistAppModel.initApp();
            }

            render() {
                const {authUsername, authCompleted, isInitialized, appLoadModel, errorDialogModel, showAbout} = hoistAppModel;

                if (!authCompleted) return this.renderPreloadMask();
                if (!authUsername)  return loginPanel();
                if (!isInitialized) return this.renderPreloadMask();

                return viewport(
                    vframe(
                        impersonationBar(),
                        frame(elem(C)),
                        versionBar()
                    ),
                    loadMask({model: appLoadModel, inline: false}),
                    errorDialog({model: errorDialogModel}),
                    aboutDialog({isOpen: showAbout})
                );
            }

            renderPreloadMask() {
                return loadMask({isDisplayed: true});
            }

            renderContextMenu() {
                return contextMenu({model: hoistAppModel.appContextMenuModel});
            }
        }
    );
}

