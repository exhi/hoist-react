/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {
    jsonInput,
    select,
    numberInput,
    switchInput,
    textInput,
    dateInput
} from '@xh/hoist/desktop/cmp/input';

import {RestFormModel} from './RestFormModel';

import {assign} from 'lodash';
import {formField} from '@xh/hoist/desktop/cmp/form';

@HoistComponent
export class RestFormField extends Component {

    static modelClass = RestFormModel;

    render() {
        const {editor} = this.props,
            name = editor.field;

        if (this.isBlankMetaData(name)) return null;

        const config = assign({field: name}, editor.formField);
        if (!config.children && !config.item && !config.items) {
            config.item = this.defaultInput(name);
        }

        return formField(config);
    }

    defaultInput() {
        const {model} = this,
            name = this.props.editor.field,
            type = model.getType(name),
            storeField = model.store.getField(name),
            fieldModel = model.formModel.fields[name];

        if (storeField.lookup) {
            return this.select(type, storeField, fieldModel);
        }

        switch (type) {
            case 'bool':
                return fieldModel.isRequired ? switchInput() : this.select(type, storeField, fieldModel);
            case 'number':
                return numberInput({width: 300});
            case 'json':
                return jsonInput({width: 300, height: 150});
            case 'date':
                return dateInput({width: 300});
            default:
                return textInput({width: 300});
        }
    }

    select(type, storeField, fieldModel) {
        let options = [];
        if (storeField.lookup) {
            options = [...storeField.lookup];
        } else if (type === 'bool') {
            options = [true, false];
        }

        if (!fieldModel.isRequired) options.unshift(null);

        return select({
            options,
            width: 300,
            enableCreate: storeField.enableCreate
        });
    }

    isBlankMetaData(name) {
        const {formModel} = this.model;
        return !formModel.values[name] && ['lastUpdatedBy', 'lastUpdated'].includes(name);
    }
}
export const restFormField = elemFactory(RestFormField);

