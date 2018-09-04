/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import ReactDOM from 'react-dom';
import {flatten} from 'lodash';

import {elem, HoistModel, AppState} from '@xh/hoist/core';
import {Exception} from '@xh/hoist/exception';
import {observable, action} from '@xh/hoist/mobx';
import {never, wait} from '@xh/hoist/promise';
import {throwIf} from '@xh/hoist/utils/js';

import {
    ConfigService,
    EnvironmentService,
    FetchService,
    IdentityService,
    IdleService,
    LocalStorageService,
    PrefService,
    TrackService
} from '@xh/hoist/svc';

import {AppContainerModel} from './appcontainer/AppContainerModel';
import {RouterModel} from './RouterModel';
import {ExceptionHandler} from './ExceptionHandler';

import {initServicesAsync} from './HoistService';

import '../styles/XH.scss';

// noinspection JSUnresolvedVariable

/**
 * Top-level Singleton model for Hoist.  This is the main entry point for the API.
 *
 * Provides access to the built-in Hoist services, metadata about the application and environment,
 * and convenience aliases to the most common framework operations. It also maintains key observable
 * application state regarding dialogs, loading, and exceptions.
 *
 * Available via import as `XH` - also installed as `window.XH` for troubleshooting purposes.
 */
@HoistModel()
class XHClass {

    //------------------------------------------------------------------
    // Metadata
    // The values below are set via webpack.DefinePlugin at build time.
    // See @xh/hoist-dev-utils/configureWebpack.
    //------------------------------------------------------------------
    /** Short internal code for the application. */
    appCode = xhAppCode;

    /** User-facing display name for the application. */
    appName = xhAppName;

    /** SemVer or Snapshot version of the client build. */
    appVersion = xhAppVersion;

    /** Git commit hash (or equivalent) of the client build. */
    appBuild = xhAppBuild;

    /** Root URL context/path - prepended to all relative fetch requests. */
    baseUrl = xhBaseUrl;

    /** Whether build is for local development */
    isDevelopmentMode = xhIsDevelopmentMode;

    //---------------------------
    // Services
    //---------------------------
    configService = new ConfigService();
    environmentService = new EnvironmentService();
    fetchService = new FetchService();
    identityService = new IdentityService();
    idleService = new IdleService();
    localStorageService = new LocalStorageService();
    prefService = new PrefService();
    trackService = new TrackService();

    //-------------------------------
    // Models
    //-------------------------------
    appContainerModel = new AppContainerModel();
    routerModel = new RouterModel();

    //-----------------------------
    // Other State
    //-----------------------------
    exceptionHandler = new ExceptionHandler();

    /** State of app -- see AppState for valid values. */
    @observable appState = AppState.PRE_AUTH;

    /** Currently authenticated user. */
    @observable authUsername = null;

    /** Currently running HoistApp - set in `renderApp()` below. */
    app = null;

    /**
     * Main entry point. Initialize and render application code.
     *
     * @param {Object} app - object containing main application state and logic.
     *      Should be an instance of a class decorated with @HoistApp.
     */
    renderApp(app) {
        this.app = app;
        const {componentClass, containerClass} = app;
        throwIf(!componentClass, 'A HoistApp must define a componentClass getter to specify its top-level component.');
        throwIf(!containerClass, 'A HoistApp must define a containerClass that it should be hosted within.');

        const rootView = elem(
            containerClass,
            {
                model: this.appContainerModel,
                item: elem(componentClass, {model: app})
            }
        );

        ReactDOM.render(rootView, document.getElementById('root'));
    }

    /**
     * Transition the application state.
     *
     * @param {AppState} appState - state to transition to.
     *
     * Used by framework.  Not intended for application use.
     */
    @action
    setAppState(appState) {
        if (this.appState != appState) {
            this.appState = appState;
            this.fireEvent('appStateChanged', {appState});
        }
    }

    /** Trigger a full reload of the app. */
    @action
    reloadApp() {
        this.appLoadModel.link(never());
        window.location.reload(true);
    }

    /**
     * Tracks globally loading promises.
     * Link any async operations that should mask the entire application to this model.
     */
    get appLoadModel() {
        return this.acm.appLoadModel;
    }

    //------------------------
    // Theme Support
    //------------------------
    /** Toggle the theme between light and dark variants. */
    toggleTheme() {
        return this.acm.themeModel.toggleTheme();
    }

    /** Is the app currently rendering in dark theme? */
    get darkTheme() {
        return this.acm.themeModel.darkTheme;
    }

    //-------------------------
    // Routing support
    //-------------------------
    /**
     * Underlying Router5 Router object implementing the routing state.
     * Applications should use this property to directly access the Router5 API.
     */
    get router() {
        return this.routerModel.router;
    }

    /**
     * The current routing state as an observable property.
     * @see RoutingManager.currentState
     */
    get routerState() {
        return this.routerModel.currentState;
    }

    /**
     * Route the app.
     *
     * Shortcut to this.router.navigate.
     */
    navigate(...args) {
        return this.router.navigate(...args);
    }

    //------------------------------
    // Message Support
    //------------------------------
    /**
     * Show a modal message dialog.
     *
     * @param {Object} config - message options.
     * @param {string} config.message - message text to be displayed.
     * @param {string} [config.title] - title of message box.
     * @param {Element} [config.icon] - icon to be displayed.
     * @param {string} [config.confirmText] - Text for confirm button. If null, no button will be shown.
     * @param {string} [config.cancelText] - Text for cancel button. If null, no button will be shown.
     * @param {string} [config.confirmIntent] - Blueprint Intent for confirm button (desktop only).
     * @param {string} [config.cancelIntent] - Blueprint Intent for cancel button (desktop only).
     * @param {function} [config.onConfirm] - Callback to execute when confirm is clicked.
     * @param {function} [config.onCancel] - Callback to execute when cancel is clicked.
     * @returns {Promise} - A Promise that will resolve to true if user confirms, and false if user cancels.
     */
    message(config) {
        return this.acm.messageSourceModel.message(config);
    }

    /**
     * Show a modal 'alert' dialog with message and default 'OK' button.
     *
     * @param {Object} config - see XH.message() for available options.
     * @returns {Promise} - A Promise that will resolve to true when user acknowledges alert.
     */
    alert(config) {
        return this.acm.messageSourceModel.alert(config);
    }

    /**
     * Show a modal 'confirm' dialog with message and default 'OK'/'Cancel' buttons.
     *
     * @param {Object} config - see XH.message() for available options.
     * @returns {Promise} - A Promise that will resolve to true if user confirms, and false if user cancels.
     */
    confirm(config) {
        return this.acm.messageSourceModel.confirm(config);
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

    /**
     * Create a new exception.
     * @see Exception.create
     */
    exception(...args) {
        return Exception.create(...args);
    }

    //---------------------------
    // Miscellaneous
    //---------------------------
    /**
     * Show a Toast.
     *
     * @param {Object} config - options for toast instance.
     * @param {string} config.message - the message to show in the toast.
     * @param {element} [config.icon] - icon to be displayed
     * @param {number} [config.timeout] - time in milliseconds to display the toast.
     * @param {string} [config.intent] - The Blueprint intent (desktop only)
     * @param {Object} [config.position] - Position in viewport to display toast. See Blueprint Position enum (desktop only).
     */
    toast(config) {
        return this.acm.toastSourceModel.show(config);
    }

    /** Show a dialog to elicit feedback text from users. */
    showFeedbackDialog() {
        return this.acm.feedbackDialogModel.show();
    }

    /** Show 'about' dialog with info about the app and environment. */
    showAboutDialog() {
        return this.acm.aboutDialogModel.show();
    }

    /**
     * Resets user customizations.
     * Clears all user preferences and local grid state, then reloads the app.
     */
    async restoreDefaultsAsync() {
        return XH.prefService.clearAllAsync().then(() => {
            XH.localStorageService.removeIf(key => key.startsWith('gridState'));
            XH.reloadApp();
        });
    }

    //----------------------------
    // Service Aliases
    //----------------------------
    track(opts)                 {return this.trackService.track(opts)}
    fetch(opts)                 {return this.fetchService.fetch(opts)}
    fetchJson(opts)             {return this.fetchService.fetchJson(opts)}
    getUser()                   {return this.identityService.getUser()}
    getUsername()               {return this.identityService.getUsername()}
    getConf(key, defaultVal)    {return this.configService.get(key, defaultVal)}
    getPref(key, defaultVal)    {return this.prefService.get(key, defaultVal)}
    setPref(key, val)           {return this.prefService.set(key, val)}
    getEnv(key)                 {return this.environmentService.get(key)}


    /**
     * Helper method to destroy resources safely (e.g. child HoistModels). Will quietly skip args
     * that are null / undefined or that do not implement destroy().
     *
     * @param {...Object} args - Objects to be destroyed.
     */
    safeDestroy(...args) {
        args = flatten(args);
        args.forEach(it => {
            if (it && it.destroy) it.destroy();
        });
    }

    //---------------------------------
    // Framework Methods
    //---------------------------------
    /**
     * Called when application mounted in order to trigger initial authentication and
     * initialization of framework and application.
     *
     * Not for application use.
     */
    async initAsync() {
        const S = AppState;
        // Add xh-app class to body element to power Hoist CSS selectors
        document.body.classList.add('xh-app');

        try {
            this.setAppState(S.PRE_AUTH);

            const authUser = await this.getAuthUserFromServerAsync();

            if (!authUser) {
                throwIf(this.app.requireSSO, 'Failed to authenticate user via SSO.');

                this.setAppState(S.LOGIN_REQUIRED);
                return;
            }

            await this.completeInitAsync(authUser.username);

        } catch (e) {
            this.setAppState(S.LOAD_FAILED);
            this.handleException(e, {requireReload: true});
        }
    }

    /**
     * Complete initialization. Called after user identity has been confirmed.
     *
     * Not for application use.
     */
    @action
    async completeInitAsync() {
        const S = AppState;

        this.setAppState(S.INITIALIZING);
        try {
            await this.initServicesAsync();
            this.initModels();

            // Delay to workaround hot-reload styling issues in dev.
            await wait(XH.isDevelopmentMode ? 300 : 1);

            const access = this.app.checkAccess(XH.getUser());
            if (!access.hasAccess) {
                this.acm.showAccessDenied(access.message || 'Access denied.');
                this.setAppState(S.ACCESS_DENIED);
                return;
            }

            await this.app.initAsync();
            this.startRouter();
            this.setAppState(S.RUNNING);
        } catch (e) {
            this.setAppState(S.LOAD_FAILED);
            this.handleException(e, {requireReload: true});
        }
    }

    //------------------------
    // Implementation
    //------------------------
    async getAuthUserFromServerAsync() {
        return await this.fetchService
            .fetchJson({url: 'auth/authUser'})
            .then(r => r.authUser);
    }

    async initServicesAsync() {
        await initServicesAsync(
            this.fetchService,
            this.localStorageService
        );
        await initServicesAsync(
            this.identityService
        );
        await initServicesAsync(
            this.configService,
            this.prefService
        );
        await initServicesAsync(
            this.environmentService,
            this.idleService,
            this.trackService
        );
    }

    initModels() {
        this.acm.init();
    }

    startRouter() {
        this.router.add(this.app.getRoutes());
        this.router.start();
    }

    get acm() {return this.appContainerModel}

    destroy() {
        this.safeDestroy(
            this.appContainerModel,
            this.routerModel,

            this.configService,
            this.environmentService,
            this.fetchService,
            this.identityService,
            this.localStorageService,
            this.prefService,
            this.trackService
        );
    }
}
export const XH = window.XH = new XHClass();
