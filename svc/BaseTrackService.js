/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

export class BaseTrackService {

    /**
     * Primary service for tracking any activity that an application's admins want to track.
     * Activities are presented to admins in the Admin App's Client Activity > Activity grid.
     * Client metadata is set automatically by the server's parsing of request headers.
     *
     * @param {(Object|string)} options - if a string, it will become the message value.
     * @param {string} [options.msg] - Short description of the activity being tracked.
     *      Required if options is an object.
     *      Can be passed as `message` for backwards compatibility.
     * @param {string} [options.category] - app-supplied category.
     * @param {(Object|Object[])} [options.data] - app-supplied data collection.
     * @param {number} [options.elapsed] - time in milliseconds the activity took.
     * @param {string} [options.severity] - importance flag, such as: OK|WARN|EMERGENCY
     *      (errors should be tracked by the ErrorTrackingService, not sent in this TrackService).
     * @param {LoadSpec} [options.loadSpec] - optional LoadSpec associated with this track.
     *      If load is an auto-refresh (loadSpec.autoRefresh = true), this tracking will be skipped.
     */
    track(options) {}
}
