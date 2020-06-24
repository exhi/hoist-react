/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {p} from '@xh/hoist/cmp/layout';
import {AppSpec, AppState, elem, ReactiveSupport} from '@xh/hoist/core';
import {Exception} from '@xh/hoist/exception';
import {action, observable} from '@xh/hoist/mobx';
import {never, wait} from '@xh/hoist/promise';
import {
    AutoRefreshService,
    ConfigService,
    EnvironmentService,
    FetchService,
    GridAutosizeService,
    GridExportService,
    IdentityService,
    IdleService,
    LocalStorageService,
    PrefService,
    TrackService,
    WebSocketService
} from '@xh/hoist/svc';
import {getClientDeviceInfo, throwIf, withShortDebug} from '@xh/hoist/utils/js';
import {compact, camelCase, flatten, isBoolean, isString, uniqueId} from 'lodash';
import ReactDOM from 'react-dom';
import parser from 'ua-parser-js';

import {AppContainerModel} from '../appcontainer/AppContainerModel';
import '../styles/XH.scss';
import {ExceptionHandler} from './ExceptionHandler';
import {RouterModel} from './RouterModel';

/**
 * Top-level Singleton model for Hoist. This is the main entry point for the API.
 *
 * Provides access to the built-in Hoist services, metadata about the application and environment,
 * and convenience aliases to the most common framework operations. It also maintains key observable
 * application state regarding dialogs, loading, and exceptions.
 *
 * Available via import as `XH` - also installed as `window.XH` for troubleshooting purposes.
 */
@ReactiveSupport
class XHClass {

    _initCalled = false;
    _lastActivityMs = Date.now();

    //----------------------------------------------------------------------------------------------
    // Metadata - set via webpack.DefinePlugin at build time.
    // See @xh/hoist-dev-utils/configureWebpack.
    //----------------------------------------------------------------------------------------------
    /** Short internal code for the application. */
    appCode = xhAppCode;

    /** User-facing display name for the application. See also `XH.clientAppName`. */
    appName = xhAppName;

    /** SemVer or Snapshot version of the client build. */
    appVersion = xhAppVersion;

    /** Git commit hash (or equivalent) of the client build. */
    appBuild = xhAppBuild;

    /** Root URL context/path - prepended to all relative fetch requests. */
    baseUrl = xhBaseUrl;

    /** Whether build is for local development */
    isDevelopmentMode = xhIsDevelopmentMode;

    //----------------------------------------------------------------------------------------------
    // Hoist Core Services
    // Singleton instances of each service are created and installed within initAsync() below.
    //----------------------------------------------------------------------------------------------
    /** @member {AutoRefreshService} */
    autoRefreshService;
    /** @member {ConfigService} */
    configService;
    /** @member {EnvironmentService} */
    environmentService;
    /** @member {FetchService} */
    fetchService;
    /** @member {GridAutosizeService} */
    gridAutosizeService;
    /** @member {GridExportService} */
    gridExportService;
    /** @member {IdentityService} */
    identityService;
    /** @member {IdleService} */
    idleService;
    /** @member {LocalStorageService} */
    localStorageService;
    /** @member {PrefService} */
    prefService;
    /** @member {TrackService} */
    trackService;
    /** @member {WebSocketService} */
    webSocketService;

    //----------------------------------------------------------------------------------------------
    // Aliased methods
    // Shortcuts to common core service methods and appSpec properties.
    //----------------------------------------------------------------------------------------------
    /**
     * @param {FetchOptions} opts
     * @return {Promise<Response>}
     */
    fetch(opts)                 {return this.fetchService.fetch(opts)}

    /**
     * @param {FetchOptions} opts
     * @return {Promise}
     */
    fetchJson(opts)             {return this.fetchService.fetchJson(opts)}

    getConf(key, defaultVal)    {return this.configService.get(key, defaultVal)}
    getPref(key, defaultVal)    {return this.prefService.get(key, defaultVal)}
    setPref(key, val)           {return this.prefService.set(key, val)}

    // Make these robust, so they don't fail if called early in initialization sequence
    track(opts)                 {return this.trackService?.track(opts)}
    getEnv(key)                 {return this.environmentService?.get(key) ?? null}
    getUser()                   {return this.identityService?.getUser() ?? null}
    getUsername()               {return this.identityService?.getUsername() ?? null}

    get isMobileApp()           {return this.appSpec.isMobileApp}
    get clientAppCode()         {return this.appSpec.clientAppCode}
    get clientAppName()         {return this.appSpec.clientAppName}

    get isPhone()               {return this.uaParser.getDevice().type === 'mobile'}
    get isTablet()              {return this.uaParser.getDevice().type === 'tablet'}
    get isDesktop()             {return this.uaParser.getDevice().type === undefined}


    //---------------------------
    // Models
    //---------------------------
    appContainerModel = new AppContainerModel();
    routerModel = new RouterModel();

    //---------------------------
    // Other State
    //---------------------------
    accessDeniedMessage = null;
    exceptionHandler = new ExceptionHandler();

    /** State of app - see AppState for valid values. */
    @observable appState = AppState.PRE_AUTH;

    /** Milliseconds since last detected user activity */
    get lastActivityMs() {return this._lastActivityMs}

    /**
     * Is Application running?
     * Observable shortcut for appState == AppState.RUNNING.
     */
    get appIsRunning() {return this.appState === AppState.RUNNING}

    /** Currently authenticated user. */
    @observable authUsername = null;

    /** Root level HoistAppModel. */
    appModel = null;

    /**
     * Specifications for this application, provided in call to `XH.renderApp()`.
     * @member {AppSpec}
     */
    appSpec = null;

    /**
     * Main entry point. Initialize and render application code.
     *
     * @param {(AppSpec|Object)} appSpec - specifications for this application.
     *      Should be an AppSpec, or a config for one.
     */
    renderApp(appSpec) {
        this.appSpec = appSpec instanceof AppSpec ? appSpec : new AppSpec(appSpec);
        const rootView = elem(appSpec.containerClass, {model: this.appContainerModel});
        ReactDOM.render(rootView, document.getElementById('xh-root'));
    }

    /**
     * Install HoistServices on this object.
     *
     * @param {...Object} serviceClasses - Classes decorated with @HoistService
     *
     * This method will create, initialize, and install the services classes listed on XH.
     * All services will be initialized concurrently. To guarantee execution order of service
     * initialization, make multiple calls to this method with await.
     *
     * Note that the instantiated services will be placed directly on the XH object for easy access.
     * Therefore applications should choose a unique name of the form xxxService to avoid naming
     * collisions. If naming collisions are detected, an error will be thrown.
     */
    async installServicesAsync(...serviceClasses) {
        const svcs = serviceClasses.map(serviceClass => new serviceClass());
        await this.initServicesInternalAsync(svcs);
        svcs.forEach(svc => {
            const name = camelCase(svc.constructor.name);
            throwIf(this[name], (
                `Service cannot be installed: property '${name}' already exists on XH object,
                indicating duplicate/conflicting service names or an (unsupported) attempt to
                install the same service twice.`
            ));
            this[name] = svc;
        });
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

    /**
     * Trigger a full reload of the current application.
     *
     * This method will reload the entire application document in the browser.
     * To simply trigger a refresh of the loadable content within the application,
     * see XH.refreshAppAsync() instead.
     **/
    @action
    reloadApp() {
        this.appLoadModel.link(never());
        window.location.reload(true);
    }

    /**
     * Refresh the current application.
     *
     * This method will do an "in-place" refresh of the loadable content as defined by the app.
     * It is a short-cut to XH.refreshContextModel.refreshAsync().
     *
     * To trigger a full reload of the application document in the browser (including code)
     * see XH.reloadApp() instead.
     */
    refreshAppAsync() {
        return this.refreshContextModel.refreshAsync();
    }

    /**
     * Tracks globally loading promises.
     * Apps should link any async operations that should mask the entire viewport to this model.
     */
    get appLoadModel() {
        return this.acm.appLoadModel;
    }

    /**
     * The global RefreshContextModel for this application.
     */
    get refreshContextModel() {
        return this.acm.refreshContextModel;
    }

    //------------------------
    // Theme Support
    //------------------------
    /** Toggle the theme between light and dark variants. */
    toggleTheme() {
        return this.acm.themeModel.toggleTheme();
    }

    /** Enable/disable the dark theme directly (useful for custom app option controls). */
    setDarkTheme(value) {
        return this.acm.themeModel.setDarkTheme(value);
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

    /** Route the app - shortcut to this.router.navigate. */
    navigate(...args) {
        return this.router.navigate(...args);
    }

    /** Add a routeName to the current route, preserving params */
    appendRoute(...args) {
        return this.routerModel.appendRoute(...args);
    }

    /** Remove last routeName from the current route, preserving params */
    popRoute() {
        return this.routerModel.popRoute();
    }

    //------------------------------
    // Message Support
    //------------------------------
    /**
     * Show a modal message dialog.
     * @param {MessageConfig} config
     *
     * Note that this method will auto focus the confirm button by default. To focus the cancel
     * button instead (e.g. for confirming risky operations), applications should specify a
     * `cancelProps` argument of the following form `cancelProps: {..., autoFocus: true}`.
     *
     * @returns {Promise} - resolves to true if user confirms, false if user cancels.
     *      If an input is provided, the Promise will resolve to the input value if user confirms.
     */
    message(config) {
        return this.acm.messageSourceModel.message(config);
    }

    /**
     * Show a modal 'alert' dialog with message and default 'OK' button.
     * @param {MessageConfig} config
     * @returns {Promise} - resolves to true when user acknowledges alert.
     */
    alert(config) {
        return this.acm.messageSourceModel.alert(config);
    }

    /**
     * Show a modal 'confirm' dialog with message and default 'OK'/'Cancel' buttons.
     * @param {MessageConfig} config
     * @returns {Promise} - resolves to true if user confirms, false if user cancels.
     */
    confirm(config) {
        return this.acm.messageSourceModel.confirm(config);
    }

    /**
     * Show a modal 'prompt' dialog with a default TextInput, message and 'OK'/'Cancel' buttons.
     *
     * The default TextInput comes with props set for:
     *   1. autoFocus = true
     *   2. selectOnFocus = true (desktop only)
     *   3. onKeyDown handler to confirm on <enter> (same as clicking 'OK') (desktop only)
     * Applications may also provide a custom HoistInput, in which all props must be set.
     *
     * @param {MessageConfig} config
     * @returns {Promise} - resolves to value of input if user confirms, false if user cancels.
     */
    prompt(config) {
        return this.acm.messageSourceModel.prompt(config);
    }

    /**
     * Show a non-modal "toast" notification that appears and then automatically dismisses.
     *
     * @param {Object} config - options for toast instance.
     * @param {(ReactNode|string)} config.message - the message to show in the toast.
     * @param {Element} [config.icon] - icon to be displayed
     * @param {number} [config.timeout] - time in milliseconds to display the toast.
     * @param {string} [config.intent] - the Blueprint intent (desktop only)
     * @param {Object} [config.position] - Position in viewport to display toast. See Blueprint
     *     Position enum (desktop only).
     * @param {Component} [config.containerRef] - Component that should contain (locate) the Toast.
     *      If null, the Toast will appear at the edges of the document (desktop only).
     */
    toast(config) {
        return this.acm.toastSourceModel.show(config);
    }

    //--------------------------
    // Exception Support
    //--------------------------
    /**
     * Handle an exception. This method is an alias for {@see ExceptionHandler.handleException}.
     *
     * This method may be called by applications in order to provide logging, reporting, and
     * display of exceptions. It it typically called directly in catch() blocks.
     *
     * See also Promise.catchDefault(). That method will delegate its arguments to this method
     * and provides a more convenient interface for catching exceptions in Promise chains.
     *
     * @param {(Error|Object|string)} exception - Error or thrown object - if not an Error, an
     *      Exception will be created via Exception.create().
     * @param {Object} [options] - controls on how the exception should be shown and/or logged.
     * @param {string} [options.message] - text (ideally user-friendly) describing the error.
     * @param {string} [options.title] - title for an alert dialog, if shown.
     * @param {boolean} [options.showAsError] - configure modal alert and logging to indicate that
     *      this is an unexpected error. Default true for most exceptions, false for those marked
     *      as `isRoutine`.
     * @param {boolean} [options.logOnServer] - send the exception to the server to be stored for
     *      review in the Hoist Admin Console. Default true when `showAsError` is true, excepting
     *      'isAutoRefresh' fetch exceptions.
     * @param {boolean} [options.showAlert] - display an alert dialog to the user. Default true,
     *      excepting 'isAutoRefresh' and 'isFetchAborted' exceptions.
     * @param {boolean} [options.requireReload] - force user to fully refresh the app in order to
     *      dismiss - default false, excepting session-related exceptions.
     * @param {Array} [options.hideParams] - A list of parameters that should be hidden from
     *      the exception log and alert.
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
    /** Show a dialog for users to set app options. */
    showOptionsDialog() {
        return this.acm.optionsDialogModel.show();
    }

    /** Show a dialog to elicit feedback text from users. */
    showFeedbackDialog() {
        return this.acm.feedbackDialogModel.show();
    }

    /** Show 'about' dialog with info about the app and environment. */
    showAboutDialog() {
        return this.acm.aboutDialogModel.show();
    }

    /** Show the impersonation bar to allow switching users. */
    showImpersonationBar() {
        return this.acm.impersonationBarModel.show();
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

    /**
     * Helper method to destroy resources safely (e.g. child HoistModels). Will quietly skip args
     * that are null / undefined or that do not implement destroy().
     *
     * @param {...Object} args - Objects to be destroyed.
     */
    safeDestroy(...args) {
        if (args) {
            args = flatten(args);
            args.forEach(it => {
                if (it?.destroy) {
                    it.destroy();
                }
            });
        }
    }

    /**
     * Generate an ID string, unique within this run of the client application and suitable
     * for local-to-client uses such as auto-generated store record identifiers.
     *
     * Deliberately *not* intended to be globally unique, suitable for reuse, or to appear as such.
     * @returns {string}
     */
    genId() {
        return uniqueId('xh-id-');
    }

    //---------------------------------
    // Framework Methods
    //---------------------------------
    /**
     * Called when application container first mounted in order to trigger initial
     * authentication and initialization of framework and application.
     * @private - not intended for application use.
     */
    async initAsync() {
        // Avoid multiple calls, which can occur if AppContainer remounted.
        if (this._initCalled) return;
        this._initCalled = true;

        const S = AppState,
            {appSpec, isMobileApp, isPhone, isTablet, isDesktop} = this;

        if (appSpec.trackAppLoad) this.trackLoad();

        // Add xh css classes to to power Hoist CSS selectors.
        document.body.classList.add(...compact([
            'xh-app',
            (isMobileApp ? 'xh-mobile' : 'xh-standard'),
            (isDesktop ? 'xh-desktop' : null),
            (isPhone ? 'xh-phone' : null),
            (isTablet ? 'xh-tablet' : null)
        ]));

        this.createActivityListeners();

        try {
            await this.installServicesAsync(FetchService);
            await this.installServicesAsync(TrackService);

            // pre-flight allows clean recognition when we have no server.
            try {
                await XH.fetch({url: 'ping'});
            } catch (e) {
                const pingURL = XH.isDevelopmentMode ?
                    `${XH.baseUrl}ping` :
                    `${window.location.origin}${XH.baseUrl}ping`;

                throw this.exception({
                    name: 'UI Server Unavailable',
                    detail: e.message,
                    message: 'Client cannot reach UI server.  Please check UI server at the ' +
                        `following location: ${pingURL}`
                });
            }

            this.setAppState(S.PRE_AUTH);

            // Instantiate appModel, await optional pre-auth init.
            this.appModel = new this.appSpec.modelClass();
            await this.appModel.preAuthInitAsync();

            // Check if user has already been authenticated (prior login, OAuth, SSO)...
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

    /**
     * Complete initialization. Called after the client has confirmed that the user is generally
     * authenticated and known to the server (regardless of application roles at this point).
     * @private - not intended for application use.
     */
    @action
    async completeInitAsync() {
        const S = AppState;

        try {

            // Install identity service and confirm access
            await this.installServicesAsync(IdentityService);
            const access = this.checkAccess();
            if (!access.hasAccess) {
                this.accessDeniedMessage = access.message || 'Access denied.';
                this.setAppState(S.ACCESS_DENIED);
                return;
            }

            // Complete initialization process
            this.setAppState(S.INITIALIZING);
            await this.installServicesAsync(LocalStorageService);
            await this.installServicesAsync(EnvironmentService, PrefService, ConfigService);
            await this.installServicesAsync(
                AutoRefreshService, IdleService, GridAutosizeService, GridExportService, WebSocketService
            );
            this.acm.init();

            this.setDocTitle();

            // Delay to workaround hot-reload styling issues in dev.
            await wait(XH.isDevelopmentMode ? 300 : 1);

            await this.appModel.initAsync();
            this.startRouter();
            this.startOptionsDialog();
            this.setAppState(S.RUNNING);
        } catch (e) {
            this.setAppState(S.LOAD_FAILED);
            this.handleException(e, {requireReload: true});
        }
    }

    //------------------------
    // Implementation
    //------------------------
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

    setDocTitle() {
        const env = XH.getEnv('appEnvironment'),
            {clientAppName} = this.appSpec;
        document.title = (env === 'Production' ? clientAppName : `${clientAppName} (${env})`);
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

    startRouter() {
        this.routerModel.addRoutes(this.appModel.getRoutes());
        this.router.start();
    }

    startOptionsDialog() {
        this.acm.optionsDialogModel.setOptions(this.appModel.getAppOptions());
    }

    get acm() {return this.appContainerModel}

    async initServicesInternalAsync(svcs) {
        const promises = svcs.map(it => {
            return withShortDebug(`Initializing ${it.constructor.name}`, () => {
                return it.initAsync();
            }, 'XH');
        });

        const results = await Promise.allSettled(promises),
            errs = results.filter(it => it.status === 'rejected');

        if (errs.length === 1) throw errs[0].reason;
        if (errs.length > 1) {
            // Enhance entire result col w/class name, we care about errs only
            results.forEach((it, idx) => {
                it.name = svcs[idx].constructor.name;
            });

            throw this.exception({
                message: [
                    p('Failed to initialize services:'),
                    ...errs.map(it => p(it.reason.message + ' (' + it.name + ')'))
                ],
                details: errs,
                isRoutine: errs.every(it => it.reason.isRoutine)
            });
        }
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
                            msg: `Loaded ${this.clientAppName}`,
                            elapsed: now - loadStarted - loginElapsed,
                            data: getClientDeviceInfo()
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

    createActivityListeners() {
        ['keydown', 'mousemove', 'mousedown', 'scroll', 'touchmove', 'touchstart'].forEach(name => {
            window.addEventListener(name, () => {
                this._lastActivityMs = Date.now();
            });
        });
    }

    get uaParser() {
        if (!this._uaParser) this._uaParser = new parser();
        return this._uaParser;
    }
}

export const XH = window.XH = new XHClass();

/**
 * @typedef {Object} MessageConfig - configuration object for a modal alert, confirm, or prompt.
 * @property {ReactNode} message - message to be displayed - a string or any valid React node.
 * @property {string} [title] - title of message box.
 * @property {Element} [icon] - icon to be displayed.
 * @property {MessageInput} [input] - config for input to be displayed (as a prompt).
 * @property {Object} [confirmProps] - props for primary confirm button.
 *      Must provide either text or icon for button to be displayed, or use a preconfigured
 *      helper such as `XH.alert()` or `XH.confirm()` for default buttons.
 * @property {Object} [cancelProps] - props for secondary cancel button.
 *      Must provide either text or icon for button to be displayed, or use a preconfigured
 *      helper such as `XH.alert()` or `XH.confirm()` for default buttons.
 * @property {function} [onConfirm] - Callback to execute when confirm is clicked.
 * @property {function} [onCancel] - Callback to execute when cancel is clicked.
 */
