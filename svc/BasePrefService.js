/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */


/**
 * Service to read and set user-specific preference values.
 *
 * Server-side preference support is provided by hoist-core. Preferences must be predefined on the
 * server (they can be managed via the Admin console) and are referenced by their string key. They
 * are assigned default values that apply to users who have yet to have a value set that is specific
 * to their account. Once set, however, the user will get their customized value instead of the
 * default going forwards.
 *
 * This could happen via an explicit option the user adjusts, or happen transparently based on a
 * natural user action or component integration (e.g. collapsing or resizing a `Resizable` that has
 * been configured with preference support).
 *
 * Preferences are persisted automatically back to the server by default so as to follow their user
 * across workstations. A `local` flag can be set on the preference definition, however, to persist
 * user values to local storage instead. This should be used for prefs that are more natural to
 * associate with a particular machine or browser (e.g. sizing or layout related options).
 */
export class BasePrefService {


    /**
     * Check to see if a given preference has been *defined*.
     * @param {string} key
     */
    hasKey(key) {}

    /**
     * Get the value for a given key, either the user-specific value (if set) or the default.
     * Typically accessed via convenience alias `XH.getPref()`.
     *
     * @param {string} key
     * @param {*} [defaultValue] - value to return if the preference key is not found - i.e.
     *      the config has not been created on the server - instead of throwing. Use sparingly!
     *      In general it's better to not provide defaults here, but instead keep entries up-to-date
     *      via the Admin client and have it be obvious when one is missing.
     */
    get(key, defaultValue) {}

    /**
     * Set a preference value for the current user.
     * Typically accessed via convenience alias `XH.setPref()`.
     *
     * Values are validated client-side to ensure they (probably) are of the correct data type.
     *
     * Values are saved to the server (or local storage) in an asynchronous and debounced manner.
     * See pushAsync() and pushPendingAsync()
     *
     * @param {string} key
     * @param {*} value - the new value to save.
     * @fires BasePrefService#prefChange - if the preference value was actually modified.
     */
    set(key, value) {}

    /**
     * Set a preference value for the current user, and immediately trigger a sync to the server.
     *
     * Useful when important to verify that the preference has been fully round-tripped - e.g.
     * before making another call that relies on its updated value being read on the server.
     *
     * @param key
     * @param value
     * @returns {Promise}
     */
    async pushAsync(key, value) {}

    /**
     * Reset all *local* preferences, reverting their effective values back to defaults.
     */
    clearLocalValues() {}

    /**
     * Reset *all* preferences, reverting their effective values back to defaults.
     * @returns {Promise} - resolves when preferences have been cleared and defaults reloaded.
     */
    async clearAllAsync() {}

    /**
     * Push any pending buffered updates to persist newly set values to server or local storage.
     * Called automatically by this app on page unload to avoid dropping changes when e.g. a user
     * changes and option and then immediately hits a (browser) refresh.
     * @returns {Promise}
     */
    async pushPendingAsync() {}


    /**
     * Fired when preference changed.
     *
     * @event BasePrefService#prefChange
     * @type {Object}
     * @property {string} key - preference key / identifier that was changed
     * @property {*} value - the new, just-set value
     * @property {*} oldValue - the prior value
     */

    /**
     * Fired when a batch of preferences updates have been pushed to storage (either local, or server).
     *
     * @event BasePrefService#prefsPushed
     * @type {Object}
     * @property {Object[]} prefs - list of preferences that were pushed
     * @property {string} prefs[].key - preference key / identifier that was changed
     * @property {*} prefs[].value - the new, just-set value
     */

}
