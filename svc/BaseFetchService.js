/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

/**
 * Service to send an HTTP request to a URL.
 *
 * Wrapper around the standard Fetch API with some enhancements to streamline the process for
 * the most common use-cases. The Fetch API will be called with CORS enabled, credentials
 * included, and redirects followed.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|Fetch API Docs}
 *
 * Note that the convenience methods 'fetchJson', 'postJson', 'putJson' all accept the same options as
 * the main entry point 'fetch'.  These methods delegate to fetch, after setting appropriate additional
 * defaults.
 */
export class BaseFetchService {

    autoAbortControllers = {};

    /**
     * Send a request via the underlying fetch API.
     *
     * @param {Object} opts - standard options to pass through to fetch, with some additions.
     *     @see https://developer.mozilla.org/en-US/docs/Web/API/Request for the available options
     * @param {string} opts.url - target url to send the HTTP request to. Relative urls will be
     *     appended to XH.baseUrl for the request.
     * @param {Object} [opts.body] - the data obj to send in the request body (for POSTs/PUTs sending JSON).
     * @param {Object} [opts.params] - parameters to encode and send with the request body
     *      (for POSTs/PUTs sending form-url-encoded) or to append as a query string.
     * @param {string} [opts.method] - The HTTP Request method to use for the request. If not
     *     explicitly set in opts then the method will be set to POST if there are params,
     *     otherwise it will be set to GET.
     * @param {string} [opts.contentType] - value to use in the Content-Type header in the request.
     *     If not explicitly set in opts then the contentType will be set based on the method. POST
     *     requests will use 'application/x-www-form-urlencoded', otherwise 'text/plain' will be
     *     used.
     * @param {boolean} [opts.acceptJson] - true to set Accept header to 'application/json'.
     * @param {Object} [opts.qsOpts] - Object of options to pass to the param converter library, qs.
     *      The default qsOpts are: {arrayFormat: 'repeat', allowDots: true}.
     *      @see {@link https://www.npmjs.com/package/qs}
     * @param {string} [opts.autoAbortKey] - If set, any pending requests associated with the same autoAbortKey will
     be immediately aborted when a new request is made.
     *
     * @returns {Promise<Response>} - Promise which resolves to a Fetch Response.
     */
    async fetch(opts) {}


    /**
     * Send an HTTP request to a URL, and decode the response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async fetchJson(opts) {
        const ret = await this.fetch({acceptJson: true, ...opts});
        return ret.status === 204 ? null : ret.json();
    }

    /**
     * Send a GET HTTP request to a URL, and decode the response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async getJson(opts) {
        opts.method = 'GET';
        return this.fetchJson(opts);
    }

    /**
     * Send an HTTP POST request to a URL with a JSON body, and decode the response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async postJson(opts) {
        opts.method = 'POST';
        return this.sendJson(opts);
    }

    /**
     * Send an HTTP POST request to a URL with a form body, and decode the response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async postJsonForm(opts) {
        opts = {
            ...opts,
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded'
        };
        return this.fetchJson(opts);
    }

    /**
     * Send a PUT HTTP request to a URL with a JSON body, and decode the response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async putJson(opts) {
        opts.method = 'PUT';
        return this.sendJson(opts);
    }

    /**
     * Send a DELETE HTTP request to a URL with an optional JSON body, and decode the optional response as JSON.
     *
     * This method delegates to @see {fetch} and accepts the same options.
     *
     * @returns {Promise} the decoded JSON object, or null if the response had no content.
     */
    async deleteJson(opts) {
        opts.method = 'DELETE';
        return this.sendJson(opts);
    }

    //-----------------------
    // Implementation
    //-----------------------
    abort(key) {
        const ctrl = this.autoAbortControllers[key];
        if (ctrl) {
            delete this.autoAbortControllers[key];
            ctrl.abort();
        }
    }

    async sendJson(opts) {
        opts = {
            ...opts,
            body: JSON.stringify(opts.body),
            contentType: 'application/json'
        };
        return this.fetchJson(opts);
    }

    async safeResponseTextAsync(response) {
        try {
            return await response.text();
        } catch (ignore) {
            return null;
        }
    }

    safeResponseText(response) {
        try {
            return response.text();
        } catch (ignore) {
            return null;
        }
    }
}