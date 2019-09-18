/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {RootRefreshContextModel} from '@xh/hoist/core/refresh';
import {observable, action} from '@xh/hoist/mobx';
import {PendingTaskModel} from '@xh/hoist/utils/async';
import {isBoolean, isString} from 'lodash';
import {XH} from '../core';
import {AppState} from '../core/AppState';
import {ExceptionHandler} from '../core/ExceptionHandler';
import {RouterModel} from '../core/RouterModel';
import {wait} from '../promise';
import {throwIf} from '../utils/js';

import {AboutDialogModel} from './AboutDialogModel';
import {ExceptionDialogModel} from './ExceptionDialogModel';
import {OptionsDialogModel} from './OptionsDialogModel';
import {FeedbackDialogModel} from './FeedbackDialogModel';
import {LoginPanelModel} from './LoginPanelModel';
import {ImpersonationBarModel} from './ImpersonationBarModel';
import {MessageSourceModel} from './MessageSourceModel';
import {ToastSourceModel} from './ToastSourceModel';
import {ThemeModel} from './ThemeModel';
import {
    AutoRefreshService,
    ConfigService,
    EnvironmentService,
    FetchService,
    GridExportService,
    IdentityService,
    IdleService,
    LocalStorageService,
    PrefService,
    TrackService,
    WebSocketService
} from '@xh/hoist/svc';

/**
 *  Root object for Framework GUI State.
 */
@HoistModel
export class AppContainerModel {

    _initCalled = false;

    /** @member {AppSpec} */
    appSpec;

    //----------------------------------------------------------------------------------------------
    // Hoist Core Services
    // Singleton instances of each service are created and installed on XH within initAsync() below.
    //----------------------------------------------------------------------------------------------
    /** @member {AutoRefreshService} */
    get autoRefreshService() {return XH.autoRefreshService}
    /** @member {ConfigService} */
    get configService() {return XH.configService}
    /** @member {EnvironmentService} */
    get environmentService() {return XH.environmentService}
    /** @member {FetchService} */
    get fetchService() {return XH.fetchService}
    /** @member {GridExportService} */
    get gridExportService() {return XH.gridExportService}
    /** @member {IdentityService} */
    get identityService() {return XH.identityService}
    /** @member {IdleService} */
    get idleService() {return XH.idleService}
    /** @member {LocalStorageService} */
    get localStorageService() {return XH.localStorageService}
    /** @member {PrefService} */
    get prefService() {return XH.prefService}
    /** @member {TrackService} */
    get trackService() {return XH.trackService}
    /** @member {WebSocketService} */
    get webSocketService() {return XH.webSocketService}

    //------------
    // Sub-models
    //------------
    @managed aboutDialogModel = new AboutDialogModel();
    @managed exceptionDialogModel = new ExceptionDialogModel();
    @managed optionsDialogModel = new OptionsDialogModel();
    @managed feedbackDialogModel = new FeedbackDialogModel();
    @managed impersonationBarModel = new ImpersonationBarModel();
    @managed loginPanelModel = new LoginPanelModel();
    @managed messageSourceModel = new MessageSourceModel();
    @managed toastSourceModel = new ToastSourceModel();
    @managed themeModel = new ThemeModel();
    @managed refreshContextModel = new RootRefreshContextModel();

    @managed routerModel = new RouterModel();

    //---------------------------
    // Other State
    //---------------------------
    exceptionHandler = new ExceptionHandler();

    /** State of app - see AppState for valid values. */
    @observable appState = AppState.PRE_AUTH;

    /** Currently authenticated user. */
    @observable authUsername = null;

    /**
     * Tracks globally loading promises.
     * Link any async operations that should mask the entire application to this model.
     */
    @managed
    appLoadModel = new PendingTaskModel({mode: 'all'});

    /** Updated App version available, as reported by server. */
    @observable updateVersion = null;

    /** Text to show if initial auth check fails. */
    @observable accessDeniedMessage = null;

    constructor(appSpec) {
        this.appSpec = appSpec;
    }

    /**
     * Show the update toolbar prompt. Called by EnvironmentService when the server reports that a
     * new (or at least different) version is available and the user should be prompted.
     *
     * @param {string} updateVersion - latest version available on server.
     */
    @action
    showUpdateBar(updateVersion) {
        this.updateVersion = updateVersion;
    }

    /**
     * Show text denying basic access to app.
     *
     * @param {string} msg - text to be shown.
     */
    @action
    showAccessDenied(msg) {
        this.accessDeniedMessage = msg;
    }

    /**
     * Called when application container first mounted in order to trigger initial
     * authentication and initialization of framework and application.
     *
     * Not intended for application use.
     */
    async initAsync() {

        // Avoid multiple calls, which can occur if AppContainer remounted.
        if (this._initCalled) return;
        this._initCalled = true;

        const S = AppState,
            {appSpec} = this;

        if (appSpec.trackAppLoad) this.trackLoad();

        // Add xh-app and platform classes to body element to power Hoist CSS selectors.
        const platformCls = XH.isMobile ? 'xh-mobile' : 'xh-desktop';
        document.body.classList.add('xh-app', platformCls);

        try {
            await XH.installServicesAsync(FetchService);
            await XH.installServicesAsync(TrackService);

            // Special handling for EnvironmentService, which makes the first fetch back to the Grails layer.
            // For expediency, we assume that if this trivial endpoint fails, we have a connectivity problem.
            try {
                await XH.installServicesAsync(EnvironmentService);
            } catch (e) {
                const pingURL = XH.isDevelopmentMode ?
                    `${XH.baseUrl}ping` :
                    `${window.location.origin}${XH.baseUrl}ping`;

                throw XH.exception({
                    name: 'UI Server Unavailable',
                    message: `Client cannot reach UI server.  Please check UI server at the following location: ${pingURL}`,
                    detail: e.message
                });
            }

            this.setAppState(S.PRE_AUTH);

            // Check if user has already been authenticated (prior login, SSO)...
            const userIsAuthenticated = await this.getAuthStatusFromServerAsync();

            // ...if not, throw in SSO mode (unexpected error case) or trigger a login prompt.
            if (!userIsAuthenticated) {
                throwIf(appSpec.isSSO, 'Failed to authenticate user via SSO.');
                this.setAppState(S.LOGIN_REQUIRED);
                return;
            }

            // ...if so, continue with initialization.
            await this.completeInitAsync();

        } catch (e) {
            this.setAppState(S.LOAD_FAILED);
            this.handleException(e, {requireReload: true});
        }
    }

    //--------------------------
    // Exception Support
    //--------------------------
    /**
     * Handle an exception.
     *
     * This method may be called by applications in order to provide logging, reporting,
     * and display of exceptions.  It it typically called directly in catch() blocks.
     *
     * This method is an alias for ExceptionHandler.handleException(). See that method for more
     * information about available options.
     *
     * See also Promise.catchDefault(). That method will delegate its arguments to this method
     * and provides a more convenient interface for Promise-based code.
     */
    handleException(exception, options) {
        return this.exceptionHandler.handleException(exception, options);
    }

    //------------------------
    // Implementation
    //------------------------

    /**
     * Complete initialization. Called after the client has confirmed that the user is generally
     * authenticated and known to the server (regardless of application roles at this point).
     * Used by framework.
     *
     * Not intended for application use.
     */
    @action
    async completeInitAsync() {
        const S = AppState;

        this.setAppState(S.INITIALIZING);
        try {
            await XH.installServicesAsync(IdentityService);
            await XH.installServicesAsync(LocalStorageService);
            await XH.installServicesAsync(PrefService, ConfigService);
            await XH.installServicesAsync(
                AutoRefreshService, IdleService, GridExportService, WebSocketService
            );
            this.initModels();

            // Delay to workaround hot-reload styling issues in dev.
            await wait(XH.isDevelopmentMode ? 300 : 1);

            const access = this.checkAccess();
            if (!access.hasAccess) {
                this.acm.showAccessDenied(access.message || 'Access denied.');
                this.setAppState(S.ACCESS_DENIED);
                return;
            }

            this.appModel = new this.appSpec.model();
            await this.appModel.initAsync();
            this.startRouter();
            this.startOptionsDialog();
            this.setAppState(S.RUNNING);
        } catch (e) {
            this.setAppState(S.LOAD_FAILED);
            this.handleException(e, {requireReload: true});
        }
    }

    /**
     * Transition the application state.
     * Used by framework. Not intended for application use.
     *
     * @param {AppState} appState - state to transition to.
     */
    @action
    setAppState(appState) {
        if (this.appState != appState) {
            this.appState = appState;
        }
    }

    initModels() {
        const models = [
            this.aboutDialogModel,
            this.exceptionDialogModel,
            this.optionsDialogModel,
            this.feedbackDialogModel,
            this.impersonationBarModel,
            this.loginPanelModel,
            this.messageSourceModel,
            this.toastSourceModel,
            this.themeModel,
            this.appLoadModel,
            this.refreshContextModel
        ];
        models.forEach(it => {
            if (it.init) it.init();
        });
    }

    startRouter() {
        this.routerModel.addRoutes(this.appModel.getRoutes());
        this.routerModel.router.start();
    }

    startOptionsDialog() {
        this.optionsDialogModel.setOptions(this.appModel.getAppOptions());
    }

    trackLoad() {
        let loadStarted = window._xhLoadTimestamp, // set in index.html
            loginStarted = null,
            loginElapsed = 0;

        const disposer = this.addReaction({
            track: () => this.appState,
            run: (state) => {
                const now = Date.now();
                switch (state) {
                    case AppState.RUNNING:
                        XH.track({
                            category: 'App',
                            msg: `Loaded ${XH.clientAppName}`,
                            elapsed: now - loadStarted - loginElapsed
                        });
                        disposer();
                        break;
                    case AppState.LOGIN_REQUIRED:
                        loginStarted = now;
                        break;
                    default:
                        if (loginStarted) loginElapsed = now - loginStarted;
                }
            }
        });
    }

    checkAccess() {
        const user = XH.getUser(),
            {checkAccess} = this.appSpec;

        if (isString(checkAccess)) {
            return user.hasRole(checkAccess) ?
                {hasAccess: true} :
                {hasAccess: false, message: `User needs the role "${checkAccess}" to access this application.`};
        } else {
            const ret = checkAccess(user);
            return isBoolean(ret) ? {hasAccess: ret} : ret;
        }
    }

    async getAuthStatusFromServerAsync() {
        return await this.fetchService
            .fetchJson({url: 'xh/authStatus'})
            .then(r => r.authenticated)
            .catch(e => {
                // 401s normal / expected for non-SSO apps when user not yet logged in.
                if (e.httpStatus == 401) return false;
                // Other exceptions indicate e.g. connectivity issue, server down - raise to user.
                throw e;
            });
    }
}