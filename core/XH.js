/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import ReactDOM from 'react-dom';
import {flatten, uniqueId, isArray, camelCase, values} from 'lodash';

import {elem, HoistModel, AppState, AppSpec} from '@xh/hoist/core';
import {Exception} from '@xh/hoist/exception';
import {observable, action} from '@xh/hoist/mobx';
import {never, allSettled} from '@xh/hoist/promise';
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
@HoistModel
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
    // Aliased methods
    //---------------------------
    track(opts)                 {return this.trackService.track(opts)}
    fetch(opts)                 {return this.fetchService.fetch(opts)}
    fetchJson(opts)             {return this.fetchService.fetchJson(opts)}
    getConf(key, defaultVal)    {return this.configService.get(key, defaultVal)}
    getPref(key, defaultVal)    {return this.prefService.get(key, defaultVal)}
    setPref(key, val)           {return this.prefService.set(key, val)}
    getEnv(key)                 {return this.environmentService.get(key)}

    getUser()                   {return this.identityService ? this.identityService.getUser() : null}
    getUsername()               {return this.identityService ? this.identityService.getUsername() : null}

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

    /** Root level HoistAppModel */
    appModel = null;

    /** Specifications for this application. Specified in renderApp() */
    appSpec = null;

    /**
     * Main entry point. Initialize and render application code.
     *
     * @param {(AppSpec|Object)} appSpec. Specifications for this application.
     *      Should be an AppSpec, or a config for one.
     */
    renderApp(appSpec) {
        this.appSpec = appSpec instanceof AppSpec ? appSpec : new AppSpec(appSpec);
        const rootView = elem(appSpec.containerClass, {model: this.appContainerModel});
        ReactDOM.render(rootView, document.getElementById('root'));
    }

    /**
     * Install HoistServices on this object.
     *
     * @param {...Object} - Classes decorated with @HoistService
     *
     * This method will create, initialize, and install the services classes listed on XH.  All services
     * will be initialized concurrently.  To guarantee execution order of service initialization make multiple calls
     * to this method with await.
     *
     * Note that the instantiated services will be placed directly on the XH object for easy access.  Therefore
     * applications should be careful to use the naming convention of choosing a unique name of the form
     * xxxService to avoid naming collisions.  If naming collisions are detected, an error will be thrown.
     */
    async installServicesAsync(...serviceClasses) {
        const svcs = serviceClasses.map(serviceClass => new serviceClass());
        await this.initServicesInternalAsync(svcs);
        svcs.forEach(svc => {
            const name = camelCase(svc.constructor.name);
            throwIf(this[name], `Service cannot be installed. Property'${name}' already exists on XH object.`);
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

    /** Route the app - shortcut to this.router.navigate. */
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

    /**
     * Show a non-modal "toast" notification that appears and then automatically dismisses.
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
                if (it && it.destroy) it.destroy();
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
     * Called when application mounted in order to trigger initial authentication and
     * initialization of framework and application.
     *
     * Not intended for application use.
     */
    async initAsync() {
        const S = AppState;
        // Add xh-app class to body element to power Hoist CSS selectors
        document.body.classList.add('xh-app');

        try {
            await this.installServicesAsync(FetchService, LocalStorageService);
            await this.installServicesAsync(EnvironmentService, TrackService, IdleService);
            this.setAppState(S.PRE_AUTH);

            // Check if user has already been authenticated (prior login, SSO)...
            const userIsAuthenticated = await this.getAuthStatusFromServerAsync();
            
            // ...if not, throw in SSO mode (unexpected error case) or trigger a login prompt.
            if (!userIsAuthenticated) {
                throwIf(XH.appSpec.isSSO, 'Failed to authenticate user via SSO.');
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
     * Used by framework.
     *
     * Not intended for application use.
     */
    @action
    async completeInitAsync() {
        const S = AppState;

        this.setAppState(S.INITIALIZING);
        try {
            await this.installServicesAsync(IdentityService);
            // TODO: Whitelist ConfigService in core and load preAuth?
            await this.installServicesAsync(PrefService, ConfigService);
            this.initModels();
            
            const access = this.checkAccess();
            if (!access.hasAccess) {
                this.acm.showAccessDenied(access.message || 'Access denied.');
                this.setAppState(S.ACCESS_DENIED);
                return;
            }

            this.appModel = new this.appSpec.modelClass();
            await this.appModel.initAsync();
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
    checkAccess() {
        const user = XH.getUser(),
            {checkAccess} = this.appSpec;

        if (!checkAccess) return {hasAccess: true};

        if (isArray(checkAccess)) {
            return {
                hasAccess: checkAccess.some(it => user.hasRole(it)),
                message: `User needs one of the following roles to access this application: ${checkAccess.join(',')}`
            };
        } else {
            return checkAccess(user);
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

    initModels() {
        this.acm.init();
    }

    startRouter() {
        this.router.add(this.appModel.getRoutes());
        this.router.start();
    }

    get acm() {return this.appContainerModel}

    async initServicesInternalAsync(svcs) {
        const promises = svcs.map(it => it.initAsync()),
            results = await allSettled(promises),
            errs = results.filter(it => it.state === 'rejected');

        if (errs.length === 1) {
            throw errs[0].reason;
        }

        if (errs.length > 1) {
            // Enhance entire result col w/class name, we care about errs only
            results.forEach((it, idx) => {
                it.name = svcs[idx].constructor.name;
            });
            const names = errs.map(it => it.name).join(', ');

            throw this.exception({
                message: 'Failed to initialize services: ' + names,
                details: errs
            });
        }
    }
    
    destroy() {
        const services = values(this).filter(v => v && v.isHoistService);
        this.safeDestroy(
            this.appContainerModel,
            this.routerModel,
            ...services
        );
    }
}
export const XH = window.XH = new XHClass();
