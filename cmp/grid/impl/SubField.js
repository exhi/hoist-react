/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

/**
 * @private
 */
export class SubField {
    colId;
    label;

    /**
     * @param {Object} s - SubField configuration.
     * @param {string} s.colId - Column ID to render.
     * @param {boolean|string} [c.label] - true to include the Column's headerName as label, or string
     */
    constructor({
        colId,
        label = false
    }) {
        this.colId = colId;
        this.label = label;
    }
}