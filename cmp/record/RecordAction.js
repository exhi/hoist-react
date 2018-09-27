/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {resolve} from '@xh/hoist/promise';
import {isBoolean, isNumber, isNil, isEmpty, isString, isObject} from 'lodash';

export class RecordAction {

    text;
    icon;
    intent;
    tooltip;
    actionFn;
    items;
    disabled;
    hidden;
    prepareFn;
    recordsRequired;

    /**
     * @param {Object} c - RecordAction configuration.
     * @param {string} [c.text] - label to be displayed.
     * @param {Object} [c.icon] - icon to be displayed.
     * @param {string} [c.intent] - intent to be used for rendering the action.
     * @param {string} [c.tooltip] - tooltip to display when hovering over the action.
     * @param {Object[]} [c.items] - child actions.
     * @param {ActionCb} [c.actionFn] - called on store action activation.
     * @param {boolean} [c.disabled] - true to disable this item.
     * @param {boolean} [c.hidden] - true to hide this item.
     * @param {PrepareFnCb} [c.prepareFn] - called prior to showing the action in the ui,show.
     *      available to modify the item based on current record / selection at time of
     * @param {(number|boolean)} [c.recordsRequired] - how many records must be 'active'
     *      (selected and / or clicked upon) for the action to be enabled.
     *      int: specifies exactly n number of records. Defaults to 1 for single record actions.
     *          Can specify 0 to only enable action if no records are active.
     *      true: specifies that number of records > 0. Allows for arbitrary number of records.
     *      false: specifies any number of records (0 - infinity, inclusive). Always active.
     * @param {(string|boolean)} [c.confirm] - whether the action needs to be confirmed before being
     *      executed. Truthy values will determine the message displayed to the user. If provided the
     *      action text will be used as the confirm button text and dialog title, otherwise "Confirm"
     *      will be displayed.
     *
     *      string: specifies the exact message to display to the user
     *      true: a generic message will be displayed to the user. If provided, the action text will
     *            be used as the verb in the confirmation message.
     *      false: action will be executed without confirmation
     */
    constructor({
        text,
        icon = null,
        intent,
        tooltip,
        actionFn = null,
        items = null,
        disabled = false,
        hidden = false,
        prepareFn = null,
        recordsRequired = false,
        confirm = false
    }) {
        this.text = text;
        this.icon = icon;
        this.intent = intent;
        this.tooltip = tooltip;
        this.actionFn = actionFn;
        this.items = items;
        this.disabled = disabled;
        this.hidden = hidden;
        this.prepareFn = prepareFn;
        this.recordsRequired = recordsRequired;
        this.confirm = confirm;
    }

    meetsRecordRequirement(count) {
        const required = this.recordsRequired;
        return isNil(required) ||
            (isBoolean(required) && (!required || required && count > 0)) ||
            (isNumber(required) && count === required);
    }

    async executeAsync({record, selModel, context}) {
        const {confirm} = this;
        let promise;
        if (confirm) {
            const {text, intent} = this;
            const cfg = {
                title: !isEmpty(text) ? `${text}?` : 'Proceed?',
                confirmText: !isEmpty(text) ? text : 'Proceed',
                confirmIntent: intent
            };

            if (isObject(confirm)) {
                Object.assign(cfg, confirm);
            } else if (isString(confirm)) {
                cfg.message = confirm;
            } else if (!isEmpty(text)) {
                cfg.message = `Are you sure you want to ${text.toLowerCase()} the record?`;
            } else {
                cfg.message = 'Are you sure you want to proceed?';
            }

            promise = XH.confirm(cfg);
        } else {
            promise = resolve(true);
        }

        const confirmed = await promise;
        if (!confirmed) return;

        this.actionFn({action: this, record, selModel, context});
    }
}

/**
 * @callback ActionCb - called on store context menu item click.
 * @param {Object} p
 * @param {ContextMenuItem} p.item - the menu item itself.
 * @param {Object} [p.record] - row data object (entire row, if any).
 * @param {Object[]} [p.selection] - all currently selected records (if any).
 * @param {*} [p.context] - additional data provided by the context where this action presides
 */

/**
 * @callback PrepareFnCb - called prior to store context menu item show, available to modify the
 *      item based on current record / selection at time of show.
 * @param {ContextMenuItem} item - the menu item itself.
 * @param {Object} [record] - row data object (entire row, if any).
 * @param {Object[]} [selection] - all currently selected records (if any).
 */
