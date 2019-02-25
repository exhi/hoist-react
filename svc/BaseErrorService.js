/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

/**
 * Persist errors and exceptions to service.
 */
export class BaseErrorService {

    /**
     * Save error to server.
     *
     * @param message - User friendly error message.
     * @param error - Detailed error information like stack traces.
     * @param userAlerted - True if user was alerted to error.
     * @returns {Promise<void>}
     */
    async saveError(message, error, userAlerted) {}
}
