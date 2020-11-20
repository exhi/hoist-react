/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HoistModel} from './HoistModel';

/**
 * Specialized base class for defining a Hoist Application. An instance of this class will be
 * initialized by Hoist after the framework has successfully initialized and will remain available
 * to all code via the XH.appModel getter.
 *
 * Applications should specify this class to provide application level state and services and
 * customize important metadata. Initialization of all resources (e.g. application level services)
 * should be done in initAsync().
 */
export class HoistAppModel extends HoistModel {

    get isHoistAppModel()   {return true}
    get isLoadSupport()     {return true}

    constructor() {
        super();
    }

    /**
     * Hoist will call this method after Hoist services have initialized and the application
     * has mounted. Use to trigger initialization of the app and any app-specific services.
     *
     * Applications will typically use this method to install and initialize app-specific
     * services using one or more phased calls to XH.installServicesAsync().
     */
    async initAsync() {}

    /**
     * Hoist will call this method early in the initialization sequence, prior to user
     * authentication. This means that several core services (identity, configs, prefs)
     * will *not* be available, but it provides the app a hook to do early service
     * initialization or other work to support flows such as OAuth.
     */
    async preAuthInitAsync() {}

    /**
     * Hoist will call this method during the global refresh process.
     *
     * This will be called after all core Hoist services have been refreshed and before the
     * application's global XH.refreshContextModel has been refreshed.
     *
     * Apps should implement this method to refresh all app-specific services, respecting any
     * ordering and phasing requirements that may exist.
     */
    async doLoadAsync(loadSpec) {}

    /**
     * Called by {@see IdentityService.logoutAsync} to provide an app-specific hook prior
     * to logging out an authenticated user. Applicable only to apps that generally support
     * logout (i.e. not SSO) and require handling in addition to Hoist server logout.
     */
    async logoutAsync() {}

    /**
     * Provide the initial set of Router5 Routes to be used by this application.
     */
    getRoutes() {
        return [];
    }

    /**
     * Provide a list of app-wide options to be displayed in the App's built-in Options
     * dialog, accessible from the default AppBar menu when this method returns non-empty.
     * @see AppOption
     *
     * @returns {Object[]} - AppOption configs. An additional `omit` property is supported
     *      here that, if true, will skip construction of that particular option and drop
     *      it out of the Options dialog.
     */
    getAppOptions() {
        return [];
    }
}