/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {computed} from 'hoist/mobx';
import {isJSON} from 'hoist/utils/JsUtils';

export class RestControlModel  {

    NULL_VALUE = 'NULL_VALUE';

    field
    editor
    parent

    get record() {return this.parent.record}

    constructor({field, editor, parent}) {
        this.field = field;
        this.editor = editor;
        this.parent = parent;
    }

    @computed
    get value()  {
        const {record, field} = this;
        return record ? record[field.name] : null;
    }
    setValue(value) {
        const {record, field} = this;
        if (value == this.NULL_VALUE) value = null;
        if (record) {
            this.parent.setValue(field.name, value);
        }
    }

    @computed
    get isValid() {
        const {field, value} = this,
            hasValue = (value != null && value !== '');
        if (hasValue && this.type == 'json') {
            return isJSON(value);
        }
        return hasValue || !field.required;
    }

    @computed
    get isEditable() {
        const {parent, field} = this;
        return field.editable === true || (field.editable === 'onAdd' && parent.isAdd);
    }

    @computed
    get type() {
        const {field} = this;
        return field.typeField ? this.getDynamicType(field.typeField) : field.type;
    }

    //---------------------
    // Implementation
    //---------------------
    getDynamicType(typeFieldName) {
        const {record, store}  = this.parent,
            field = store.getField(typeFieldName);
        const rawType = record && field ? record[field.name] : null;

        switch (rawType) {
            case 'double':
            case 'int':
            case 'long':
                return 'number';
            default:
                return rawType || 'string';
        }
    }
}