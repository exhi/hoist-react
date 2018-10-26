/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import React, {Component} from 'react';
import PT from 'prop-types';
import uniqueId from 'react-html-id';
import {isArray, isUndefined} from 'lodash';

import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {formGroup, spinner, tooltip} from '@xh/hoist/kit/blueprint';
import {HoistInput} from '@xh/hoist/cmp/form';
import {div, fragment, span} from '@xh/hoist/cmp/layout';
import {Icon} from '@xh/hoist/icon';
import {throwIf} from '@xh/hoist/utils/js';

import './FormField.scss';

/**
 * Standardised wrapper around a HoistInput Component.
 *
 * Should receive a single HoistInput as a child element. FormField is typically bound
 * to a model enhanced with `@FieldSupport` via its `model` and `field` props. This allows
 * FormField to automatically display a label, a required asterisk, and any validation messages.
 *
 * When FormField is used in bound mode, the child HoistInput should *not* declare its own
 * `model` and `field` props, as these are managed by the FormField.
 *
 * Accepts any props supported by Blueprint's FormGroup.
 */
@HoistComponent
export class FormField extends Component {

    static propTypes = {

        /** Bound Model. */
        model: PT.object,

        /** Name of bound property on Model. */
        field: PT.string,

        /**
         * Label for form field.
         * Defaults to Field displayName if used with @FieldSupport. Set to null to hide label.
         */
        label: PT.string,

        /** Apply minimal styling - validation errors are only displayed with a tooltip */
        minimal: PT.bool,

        /** Display warning glyph in the far left side of the input (TextField, NumberInput only) */
        leftErrorIcon: PT.bool,

        /** CSS id */
        labelFor: PT.string,

        /** True by default.  If false, clicking on label won't put the label's control in focus. */
        clickableLabel: PT.bool
    };

    baseClassName = 'xh-form-field';

    blockChildren = ['TextInput', 'JsonInput'];

    constructor(props) {
        super(props);
        if (!props.labelFor && props.clickableLabel !== false) uniqueId.enableUniqueIds(this);
    }

    render() {
        const {model, field, label, minimal, className, labelFor, clickableLabel = true, ...rest} = this.props,
            hasFieldSupport = model && field && model.hasFieldSupport,
            fieldModel = hasFieldSupport ? model.getField(field) : null,
            isRequired = fieldModel && fieldModel.isRequired,
            isPending = fieldModel && fieldModel.isValidationPending,
            notValid = fieldModel && fieldModel.isNotValid,
            errors = fieldModel ? fieldModel.errors : [],
            labelStr = isUndefined(label) ? (fieldModel ? fieldModel.displayName : null) : label,
            uniqueId = !clickableLabel ? undefined : labelFor ? labelFor : this.nextUniqueId(),
            requiredStr = isRequired ? span(' *') : null,
            item = this.prepareChild(notValid, errors, uniqueId),
            classes = [];

        if (isRequired) classes.push('xh-form-field-required');
        if (notValid) classes.push('xh-form-field-invalid');
        if (minimal) classes.push('xh-form-field-minimal');

        return formGroup({
            item,
            width: 50,
            label: span({
                item: labelStr ? span(labelStr, requiredStr) : null,
                className: minimal && notValid ? 'xh-form-field-error-label' : null
            }),
            labelFor: uniqueId,
            className: this.getClassName(classes),
            helperText: !minimal ? fragment(
                div({
                    omit: !isPending || minimal,
                    className: 'xh-form-field-pending',
                    item: spinner({size: 15})
                }),
                div({
                    omit: !notValid || minimal,
                    className: 'xh-form-field-error-msg',
                    items: notValid ? tooltip({
                        item: errors[0],
                        content: this.getErrorTooltipContent(errors)
                    }) : null
                })
            ) : null,
            ...rest
        });
    }


    //--------------------
    // Implementation
    //--------------------
    prepareChild(notValid, errors, uniqueId) {
        const {model, field, minimal, disabled} = this.props,
            item = this.props.children;

        throwIf(!item || isArray(item) || !(item.type.prototype instanceof HoistInput), 'FormField child must be a single component that extends HoistInput.');
        throwIf(item.props.field || item.props.model, 'HoistInputs should not declare "field" or "model" when used with FormField');

        const leftIcon = notValid ? this.leftIcon(item) : {},
            target = React.cloneElement(item, {model, field, disabled, id: uniqueId, ...leftIcon});

        if (!minimal) return target;

        // Wrap target in a tooltip if in minimal mode
        return tooltip({
            target,
            targetClassName: `xh-input ${notValid ? 'xh-input-invalid' : ''}`,
            wrapperTagName: 'div',
            targetTagName: !this.blockChildren.includes(target.type.name) || target.props.width ? 'span' : 'div',
            position: 'right',
            disabled: !notValid,
            content: this.getErrorTooltipContent(errors)
        });
    }

    leftIcon(item) {
        const leftIcon = item.props.leftIcon || (this.props.leftErrorIcon ? Icon.warningCircle() : null);
        return item.type.propTypes.leftIcon ? {leftIcon} : {};
    }

    getErrorTooltipContent(errors) {
        if (!errors || !errors.length) return null;
        if (errors.length == 1) return errors[0];
        return (
            <ul className="xh-form-field-error-tooltip">
                {errors.map((it, idx) => <li key={idx}>{it}</li>)}
            </ul>
        );
    }

}

export const formField = elemFactory(FormField);