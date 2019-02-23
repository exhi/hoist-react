/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

/**
 * Manage authorization using tokens.
 */
export class BaseAuthService {

    /**
     * Return true if authenticated.
     *
     * May automatically perform auth when SSO available.
     */
    async isAuthenticatedAsync() {}

    /**
     * Attempt form based authentication.
     *
     * Return true if authentication succeeded.
     */
    async loginAsync(username, password) {}

    /**
     * For applications that support a logout operation (i.e. not SSO), logs the current user out
     * and refreshes the application to present a login panel.
     */
    async logoutAsync() {}
}
