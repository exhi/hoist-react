/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import React, {Component} from 'react';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {PropTypes as PT} from 'prop-types';
import {HoistInput} from '@xh/hoist/cmp/form';
import {formGroup, spinner} from '@xh/hoist/kit/blueprint';
import {fragment, div, span} from '@xh/hoist/cmp/layout';
import {throwIf} from '@xh/hoist/utils/js';
import {isArray} from 'lodash';

import './FormField.scss';

/**
 * Standardised wrapper around HoistInputs.
 *
 * Should receive a single HoistInput as a child element. If the HoistInput is bound
 * to a model enhanced by `@FieldSupport`, FormField will automatically display a label,
 * a required asterisk and validation state.
 *
 * Accepts any props supported by Blueprint's FormGroup.
 */
@HoistComponent
export class FormField extends Component {

    static propTypes = {
        /** model to bind to */
        model: PT.object,
        /** name of property in model to bind to */
        field: PT.string,
        /** optional label for form field */
        label: PT.string
    };

    baseClassName = 'xh-form-field';

    render() {
        const {model, field, ...rest} = this.props,
            item = this.prepareChild(),
            hasFieldSupport = model && field && model.hasFieldSupport,
            fieldModel = hasFieldSupport ? model.getField(field) : null,
            isRequired = fieldModel && fieldModel.isRequired,
            isPending = fieldModel && fieldModel.isValidationPending,
            notValid = fieldModel && fieldModel.isNotValid,
            errors = fieldModel ? fieldModel.errors : [],
            labelStr = this.props.label || (fieldModel ? fieldModel.displayName : null),
            label = isRequired ? div(labelStr, span(' *')) : div(labelStr);

        return formGroup({
            label,
            item,
            className: this.getClassName(notValid ? 'xh-form-field-invalid' : ''),
            helperText: fragment(
                div({
                    omit: !isPending,
                    className: 'xh-form-field-pending',
                    item: spinner({size: 15})
                }),
                div({
                    omit: !notValid,
                    className: 'xh-form-field-error-msg',
                    item: notValid ? errors[0] : null,
                    title: notValid ? errors.join('. ') : null
                })
            ),
            ...rest
        });
    }

    //--------------------
    // Implementation
    //--------------------
    prepareChild() {
        const {model, field, disabled} = this.props,
            item = this.props.children;

        throwIf(isArray(item) || !(item.type.prototype instanceof HoistInput), 'FormField child must be a single component that extends HoistInput.');
        throwIf(item.props.field || item.props.model, 'HoistInputs should not declare "field" or "model" when used with FormField');

        return React.cloneElement(item, {model, field, disabled});
    }

}

export const formField = elemFactory(FormField);