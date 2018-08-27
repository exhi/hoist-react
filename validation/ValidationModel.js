/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistModel} from '@xh/hoist/core';
import {computed} from '@xh/hoist/mobx';
import {values} from 'lodash';

import {Rule} from './Rule';
import {Validator} from './Validator';

/**
 * Monitors model and provides observable validation state, according to a set
 * of configured validation rules.
 */
@HoistModel()
export class ValidationModel {

    _validators = {};
    model;

    /**
     * Validators for individual fields.
     *
     * @return {Validator[]}
     */
    get validators() {
        return values(this._validators);
    }

    /**
     * Get a validator (if any) for a given field.
     *
     * @param {string} field
     */
    getValidator(field) {
        return this.validators[field];
    }

    /**
     * Are all validating fields currently valid? .
     */
    @computed
    get isValid() {
        return this.validators.every(it => it.isValid);
    }

    /**
     * Are any of the validated fields currently pending?
     */
    @computed
    get isPending() {
        return this.validators.some(it => it.isPending);
    }

    /**
     * @param {Object} model - HoistModel to validate
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Add validation rules for a field in this model.
     *
     * @param {String} field
     * @param {...(Rule|Object)} configs - configurations for Rules.
     */
    addRules(field, ...rules) {
        const {model, _validators} = this;

        rules = rules.map(r => r instanceof Rule ? r : new Rule(r));

        let validator = _validators[field];
        if (!validator) {
            _validators[field] = new Validator({field, model, rules});
        } else {
            validator.addRules(rules);
        }
    }

    destroy() {
        XH.destroy(this.validators);
    }
}