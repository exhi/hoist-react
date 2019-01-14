/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {flatten, isEmpty, startCase, partition, isFunction, isUndefined} from 'lodash';
import {HoistModel} from '@xh/hoist/core';
import {observable, action, computed} from '@xh/hoist/mobx';
import {PendingTaskModel} from '@xh/hoist/utils/async/PendingTaskModel';

import {ValidationState} from '../validation/ValidationState';
import {Rule} from '../validation/Rule';

/**
 *
 * A data field in a Form.
 */
@HoistModel
export class FieldModel {

    /** @member {FormModel} owning field */
    _formModel;


    /** @member {string} name of property within model containing this field. */
    name;
    /** @member {*} initial value of this field. */
    initialValue;
    /** @member {*} value of this field. */
    @observable.ref value;
    /** @member {string} user visible name for a field.  For use in validation messages and form labelling. */
    @observable displayName;
    /** @member {boolean}.  True to disable input on this field.*/
    @observable disabled;
    /** @member {boolean}.  True to make this field read-only.*/
    @observable readonly;
    /** @member {Rule[]} list of validation rules to apply to this field. */
    @observable.ref rules = [];
    /** @member {String[]} list of validation errors.  Null if the validity state not computed. */
    @observable.ref errors = null;

    /**
     * @member {boolean}
     * Should the GUI currently display this validation? False when a validation is "passive",
     * because, e.g. the field has not yet been visited or edited since the last reset.
     */
    @observable validationDisplayed = false;

    _validationTask = new PendingTaskModel();
    _validationRunId = 0;

    /**
     * @param {Object} cfg
     * @param {string} cfg.name
     * @param {string} [cfg.displayName]
     * @param {*} [cfg.initialValue]
     * @param {boolean} [cfg.disabled]
     * @param {boolean} [cfg.readonly]
     * @param {(Rule|Object|Function)} [cfg.rules] -
     *      Rules, rule configurations, or validation functions to create rules.
     *      (All validation functions supplied will be combined in to a single rule)
     */
    constructor({
        name,
        displayName = startCase(name),
        initialValue = null,
        disabled = false,
        readonly = false,
        rules = []
    }) {
        this.name = name;
        this.displayName = displayName;
        this.value = initialValue;
        this.initialValue = initialValue;
        this.disabled = disabled;
        this.readonly = readonly;
        this.rules = this.processRuleSpecs(rules);
    }

    //-----------------------------
    // Accessors and lifecycle
    //-----------------------------
    /**
     * Owning FormModel for this Field.
     *
     * Not set directly by applications.  See FormModel.addField().
     */
    get formModel() {
        return this._formModel;
    }
    set formModel(formModel) {
        this._formModel = formModel;
        this.addAutorun(() => {
            this.computeValidationAsync();
        });
        this.addAutorun(() => {
            if (this.isDirty) this.displayValidation(false);
        });
    }

    /** Proxy for accessing all of the current data values in this field by name. */
    get values() {
        return this.value;
    }

    /**
     * The current data in this field, fully enumerated.  Used for gather and submitting form data to a server.
     */
    getData() {
        return this.value;
    }

    @action
    setValue(v) {
        this.value = v;
    }

    /**
     * List of all validation errors for this field and its sub-forms.
     */
    get allErrors() {
        return this.errors || [];
    }


    /**
     * Set the initial value of the field, reset
     * to that value, and reset validation state.
     */
    @action
    init(initialValue) {
        if (!isUndefined(initialValue)) {
            this.initialValue = initialValue;
        }
        this.reset();
    }

    /** Reset to the initial value and reset validation state. */
    @action
    reset() {
        this.value = this.initialValue;
        this.errors = null;
        this.validationDisplayed = false;
    }

    //----------------------
    // Disabled/readonly
    //----------------------
    @action
    setDisabled(disabled) {
        this.setDisabled = disabled;
    }

    @action
    setReadonly(readonly) {
        this.setReadonly = readonly;
    }


    //------------------------------------
    // Validation
    //------------------------------------
    /**
     * Set the validationDisplayed property to true.
     *
     * @param {boolean} [includeSubforms] - true to include all subforms of this field.
     *
     * Typically called when containing form is validated, when the field is dirtied or
     * a HoistInput bound to the field is blurred.  May also be called manually,
     * e.g. when the user requests to move to next page, validate buttons, etc.
     **/
    @action
    displayValidation(includeSubforms = true) {
        this.validationDisplayed = true;
    }

    /** Validation state of the field. */
    get validationState() {
        const VS = ValidationState;
        const {errors, rules} = this;
        return (errors == null) ?
            isEmpty(rules) ? VS.Valid : VS.Unknown :
            isEmpty(errors) ? VS.Valid : VS.NotValid;
    }

    /** True if this field is confirmed to be Valid. **/
    get isValid() {
        return this.validationState == ValidationState.Valid;
    }

    /** True if this field is confirmed to be NotValid. **/
    get isNotValid() {
        return this.validationState == ValidationState.NotValid;
    }

    /**
     * Is the validation of the field currently pending?
     *
     * Return true if this validator is awaiting completion of a re-evaluation.
     * If true, the current state is out of date and should be considered provisional.
     */
    get isValidationPending() {
        return this._validationTask.isPending;
    }

    /**
     * Is a non-nullish (null or undefined) value for this field required?
     * This getter will return true if there is an active rule with the 'required' constraint.
     */
    @computed
    get isRequired() {
        return this.rules.some(r => r.requiresValue(this));
    }
    
    /**
     * Recompute all validations and return true if the field is valid.
     *
     * @param {Object} [c]
     * @param {boolean] [c.display] - true to activate validation display
     *      for the field after validation has been peformed.
     *
     * @returns {Promise<boolean>} - the validation state of the object.
     */
    @action
    async validateAsync({display = true} = {}) {
        await this.computeValidationAsync();
        if (display) this.displayValidation();
        return this.isValid;
    }

    //------------------------------
    // Dirty State
    //------------------------------
    /** Does the field have changes from its initial state? */
    get isDirty() {
        return this.value !== this.initialValue;
    }

    //--------------------------
    // Implementation
    //-------------------------
    processRuleSpecs(ruleSpecs) {
        // Peel off raw validations into a single rule spec
        const [constraints, rules] = partition(ruleSpecs, isFunction);
        if (!isEmpty(constraints)) {
            rules.push({check: constraints});
        }
        return rules.map(r => r instanceof Rule ? r : new Rule(r));
    }

    
    async computeValidationAsync() {
        const runId = ++this._validationRunId;
        return this
            .evaluateAsync(this.rules)
            .thenAction(errors => {
                if (runId == this._validationRunId) {
                    this.errors = errors;
                }
                return this.validationState;
            }).linkTo(this._validationTask);
    }

    async evaluateAsync(rules) {
        const promises = rules.map(r => r.evaluateAsync(this));
        return flatten(await Promise.all(promises));
    }
}
