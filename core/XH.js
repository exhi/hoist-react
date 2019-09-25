/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {AppState, elem, ReactiveSupport} from '@xh/hoist/core';
import {Exception} from '@xh/hoist/exception';
import {action} from '@xh/hoist/mobx';
import {never} from '@xh/hoist/promise';
import {throwIf, withShortDebug} from '@xh/hoist/utils/js';
import {camelCase, flatten, uniqueId} from 'lodash';
import ReactDOM from 'react-dom';

import {AppContainerModel} from '../appcontainer/AppContainerModel';
import {AppSpec} from '../appcontainer/AppSpec';
import {ChildContainerModel} from '../appcontainer/child/ChildContainerModel';
import {ChildSpec} from '../appcontainer/child/ChildSpec';
import '../styles/XH.scss';
import {ChildContainer} from '../desktop/appcontainer';

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
    // Singleton instances of each service are installed on XH by the AppContainer
    //----------------------------------------------------------------------------------------------
    /** @member {AutoRefreshService} */
    autoRefreshService;
    /** @member {ConfigService} */
    configService;
    /** @member {EnvironmentService} */
    environmentService;
    /** @member {FetchService} */
    fetchService;
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
    /** @member {WindowService} */
    windowService;

    //----------------------------------------------------------------------------------------------
    // Aliased methods
    // Shortcuts to common core service methods and appSpec properties.
    //----------------------------------------------------------------------------------------------
    track(opts) {return this.trackService.track(opts)}
    fetch(opts) {return this.fetchService.fetch(opts)}
    fetchJson(opts) {return this.fetchService.fetchJson(opts)}
    getConf(key, defaultVal) {return this.configService.get(key, defaultVal)}
    getPref(key, defaultVal) {return this.prefService.get(key, defaultVal)}
    setPref(key, val) {return this.prefService.set(key, val)}
    getEnv(key) {return this.environmentService.get(key)}

    getUser() {return this.identityService ? this.identityService.getUser() : null}
    getUsername() {return this.identityService ? this.identityService.getUsername() : null}

    get appModel() {return this.appContainerModel.appModel}
    get appSpec() {return this.appContainerModel.appSpec}

    get isMobile() {return this.appContainerModel.appSpec.isMobile}
    get clientAppCode() {return this.appContainerModel.appSpec.clientAppCode}
    get clientAppName() {return this.appContainerModel.appSpec.clientAppName}

    createWindowAsync(params) {return this.windowService.createWindowAsync(params)}

    //---------------------------
    // Models
    //---------------------------

    /** @member {AppContainerModel} */
    appContainerModel;

    /** @member {AppContainerModel|ChildContainerModel} */
    containerModel;

    /**
     * Is Application running?
     * Observable shortcut for appState == AppState.RUNNING.
     */
    get appIsRunning() {return this.acm.appState === AppState.RUNNING}

    /**
     * Main entry point. Initialize and render application code.
     *
     * @param {(AppSpec|Object)} appSpec - specifications for this application.
     *      Should be an AppSpec, or a config for one.
     */
    renderApp(appSpec) {
        appSpec = appSpec instanceof AppSpec ? appSpec : new AppSpec(appSpec);

        const isChildWindow = !!window.opener;
        let container = appSpec.container;
        if (isChildWindow) {
            throwIf(appSpec.isMobile, 'Child windows are not supported on mobile!');

            // TODO: Make sure we were opened from the same app?

            const startTime = new Date().getTime();
            while (!window.opener.XH) {
                if (new Date().getTime() - startTime >= 30000) {
                    console.error('No XH available for Child window after 30 seconds');
                    break;
                }
            }

            console.debug(`Got parent XH reference after ${new Date().getTime() - startTime}ms`);

            if (!window.opener.XH) {
                this.appContainerModel = this.containerModel = new AppContainerModel(appSpec);
            } else {
                this.appContainerModel = window.opener.XH.appContainerModel;
                this.containerModel = new ChildContainerModel(appSpec, this.appContainerModel, window);
                container = ChildContainer;

                document.body.classList.add('xh-child');
            }
        } else {
            this.appContainerModel = this.containerModel = new AppContainerModel(appSpec);
        }

        // Add xh-app and platform classes to body element to power Hoist CSS selectors.
        const platformCls = XH.isMobile ? 'xh-mobile' : 'xh-desktop';
        document.body.classList.add('xh-app', platformCls);

        const rootView = elem(container, {model: this.containerModel});
        ReactDOM.render(rootView, document.getElementById('xh-root'));
    }

    openSlaveWindow(childSpec) {
        const childWindow = window.open('about:blank', '_blank', 'width=300,height=300,menubar=no,status=no,titlebar=no,location=no,toolbar=no');
        childWindow.xhIsSlaveWindow = true;

        childSpec = childSpec instanceof ChildSpec ? childSpec : new ChildSpec(childSpec);
        const containerModel = new ChildContainerModel(childSpec, this.appContainerModel, childWindow, true);

        // Add xh-app and platform classes to body element to power Hoist CSS selectors.
        const platformCls = XH.isMobile ? 'xh-mobile' : 'xh-desktop';
        childWindow.document.body.classList.add('xh-app', platformCls);

        childWindow.document.head.append(...Array.from(window.document.head.childNodes).map(it => it.cloneNode(true)));

        const root = childWindow.document.createElement('div');
        root.setAttribute('class', 'xh-root');
        childWindow.document.body.appendChild(root);

        const rootView = elem(childSpec.container, {model: containerModel});
        ReactDOM.render(rootView, root);
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
        // TODO: Do we want to do this?
        throwIf(!(this.cm instanceof AppContainerModel), 'Services should only be installed by the main App window!');

        const services = serviceClasses.map(serviceClass => new serviceClass());
        await this.initServicesInternalAsync(services);
        this.registerServices(services);
    }

    registerServices(services) {
        services.forEach(svc => {
            const name = camelCase(svc.constructor.name);
            throwIf(this[name], (
                `Service cannot be installed: property '${name}' already exists on XH object,
                indicating duplicate/conflicting service names or an (unsupported) attempt to
                install the same service twice.`
            ));
            this.cm.installedServices[name] = svc;

            Object.defineProperty(this, name, {
                get: () => svc,
                set: () => {
                    throw XH.exception(`Services are read-only. Use installServicesAsync to install new services.`);
                }
            });
        });
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
    get hasRouter() {
        return this.cm && this.cm.routerModel;
    }

    /**
     * Underlying Router5 Router object implementing the routing state.
     * Applications should use this property to directly access the Router5 API.
     */
    get router() {
        return this.cm.routerModel.router;
    }

    /**
     * The current routing state as an observable property.
     * @see RoutingManager.currentState
     */
    get routerState() {
        return this.cm.routerModel.currentState;
    }

    /** Route the app - shortcut to this.router.navigate. */
    navigate(...args) {
        return this.router.navigate(...args);
    }

    /** Add a routeName to the current route, preserving params */
    appendRoute(...args) {
        return this.cm.appendRoute(...args);
    }

    /** Remove last routeName from the current route, preserving params */
    popRoute() {
        return this.cm.popRoute();
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
     * @param {MessageInput} [config.input] - config for input to be displayed (as a prompt).
     * @param {string} [config.confirmProps] - props for primary confirm button.
     *      Must provide either text or icon for button to be displayed, or use a preconfigured
     *      helper such as `XH.alert()` or `XH.confirm()` for default buttons.
     * @param {string} [config.cancelProps] - props for secondary cancel button.
     *      Must provide either text or icon for button to be displayed, or use a preconfigured
     *      helper such as `XH.alert()` or `XH.confirm()` for default buttons.
     * @param {function} [config.onConfirm] - Callback to execute when confirm is clicked.
     * @param {function} [config.onCancel] - Callback to execute when cancel is clicked.
     *
     *
     * Note that this method will auto focus the confirm button by default.  To focus the
     * cancel button instead (e.g. for confirming risky operations), applications should specify a
     * cancelProps argument of the following form:  cancelProps: {..., autoFocus: true}.
     *
     * @returns {Promise} - resolves to true if user confirms, false if user cancels.
     *      If an input is provided, the Promise will resolve to the input value if user confirms.
     */
    message(config) {
        return this.cm.messageSourceModel.message(config);
    }

    /**
     * Show a modal 'alert' dialog with message and default 'OK' button.
     *
     * @param {Object} config - see XH.message() for available options.
     * @returns {Promise} - resolves to true when user acknowledges alert.
     */
    alert(config) {
        return this.cm.messageSourceModel.alert(config);
    }

    /**
     * Show a modal 'confirm' dialog with message and default 'OK'/'Cancel' buttons.
     *
     * @param {Object} config - see XH.message() for available options.
     * @returns {Promise} - resolves to true if user confirms, false if user cancels.
     */
    confirm(config) {
        return this.cm.messageSourceModel.confirm(config);
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
     * @param {Object} config - see XH.message() for available options.
     * @returns {Promise} - resolves to value of input if user confirms, false if user cancels.
     */
    prompt(config) {
        return this.cm.messageSourceModel.prompt(config);
    }

    /**
     * Show a non-modal "toast" notification that appears and then automatically dismisses.
     *
     * @param {Object} config - options for toast instance.
     * @param {string} config.message - the message to show in the toast.
     * @param {Element} [config.icon] - icon to be displayed
     * @param {number} [config.timeout] - time in milliseconds to display the toast.
     * @param {string} [config.intent] - The Blueprint intent (desktop only)
     * @param {Object} [config.position] - Position in viewport to display toast. See Blueprint
     *     Position enum (desktop only).
     * @param {Component} [config.containerRef] - Component that should contain (locate) the Toast.
     *      If null, the Toast will appear at the edges of the document (desktop only).
     */
    toast(config) {
        return this.cm.toastSourceModel.show(config);
    }

    //--------------------------
    // Exception Support
    //--------------------------

    handleException(exception, options) {
        return this.cm.handleException(exception, options);
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
                if (it && it.destroy) {
                    console.debug('[XH] Destroying', it);
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

    get acm() {return this.appContainerModel}
    get cm() {return this.containerModel}

    async initServicesInternalAsync(svcs) {
        const promises = svcs.map(it => {
            return withShortDebug(`Initializing ${it.constructor.name}`, () => {
                return it.initAsync();
            }, 'XH');
        });

        const results = await Promise.allSettled(promises),
            errs = results.filter(it => it.status === 'rejected');

        if (errs.length > 0) {
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
}

export const XH = window.XH = new XHClass();
