/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {elemFactory} from 'hoist';
import {action, observer, observable} from 'hoist/mobx';
import {vbox, div, filler} from 'hoist/layout';
import {Classes, button, dialog, dialogBody, dialogFooter, dialogFooterActions, icon, inputGroup, label, menuItem, numericInput, select, suggest, textArea} from 'hoist/kit/blueprint';

@observer
export class RestFormBlueprint extends Component {

    @observable needConfirm = false;

    render() {
        const {formRecord, formIsAdd} = this.model;
        if (!formRecord) return null;

        return dialog({
            title: formIsAdd ? 'Add Record' : 'Edit Record',
            iconName: 'inbox',
            isOpen: true,
            onClose: this.onClose,
            items: this.renderDialogItems()
        });
    }

    //--------------------------------
    // Implementation
    //--------------------------------
    get model() {return this.props.model}
    get editWarning() {return this.props.model.editWarning}

    renderDialogItems() {
        const items = [
            dialogBody(this.getForm()),
            dialogFooter(
                dialogFooterActions(this.getButtons())
            )
        ];

        if (this.editWarning) {
            items.push(
                dialog({
                    isOpen: this.needConfirm,
                    isCloseButtonShown: false,
                    title: 'Confirm',
                    items: [
                        div({
                            cls: 'pt-dialog-body',
                            item: this.editWarning
                        }),
                        div({
                            cls: 'pt-dialog-footer',
                            item: div({
                                cls: 'pt-dialog-footer-actions',
                                items: this.getConfirmButtons()
                            })
                        })
                    ]
                })
            );
        }

        return items;
    }

    getForm() {
        const {editors, recordSpec, formRecord} = this.model,
            fields = recordSpec.fields,
            valueType = formRecord.valueType,
            items = [];

        editors.forEach(editor => {
            const fieldSpec = fields.find(it => it.name === editor.field);
            if (fieldSpec.typeField) fieldSpec.type = valueType;

            const inputConfig = this.getInputConfig(fieldSpec, editor, formRecord),
                inputType = this.getInputType(fieldSpec, editor);

            items.push(this.createFieldLabel(fieldSpec));
            switch (inputType) {
                case 'dropdown':
                    items.push(this.createDropdown(inputConfig));
                    break;
                case 'boolean':
                    items.push(this.createBooleanDropdown(inputConfig));
                    break;
                case 'number':
                    items.push(this.createNumberInput(inputConfig));
                    break;
                case 'textarea':
                    items.push(this.createTextAreaInput(inputConfig));
                    break;
                case 'text':
                    items.push(this.createTextInput(inputConfig));
                    break;
                default:
                    items.push(this.createTextInput(inputConfig));
            }
        });

        return vbox({
            cls: 'rest-form',
            width: 400,
            padding: 10,
            items
        });
    }

    getButtons() {
        const {formIsValid, formIsWritable, enableDelete, formIsAdd} = this.model;

        return [
            button({
                text: 'Close',
                iconName: 'cross',
                onClick: this.onClose
            }),
            filler(),
            button({
                text: 'Delete',
                iconName: 'cross',
                disabled: !formIsValid,
                onClick: this.onDeleteClick,
                omit: !enableDelete || formIsAdd
            }),
            button({
                text: 'Save',
                iconName: 'tick',
                disabled: !formIsValid,
                onClick: this.onSaveClick,
                omit: !formIsWritable
            })
        ];
    }

    getConfirmButtons() {
        return [
            filler(),
            button({
                text: 'Yes',
                onClick: this.doSave
            }),
            button({
                text: 'No',
                onClick: this.closeConfirm
            }),
            filler()
        ];
    }
    onClose = () => {
        this.model.closeForm();
    }

    onDeleteClick = () => {
        const model = this.model;
        model.deleteRecord(model.formRecord);
    }

    @action
    onSaveClick = () => {
        if (this.editWarning) {
            this.needConfirm = true;
        } else {
            this.doSave();
        }
    }

    @action
    doSave = () => {
        const model = this.model;
        model.saveFormRecord();
        this.closeConfirm();
    }

    @action
    closeConfirm = () => {
        this.needConfirm = false;
    }

    createFieldLabel(fieldSpec) {
        const text = fieldSpec.label || fieldSpec.name;
        return label({text: text, style: {width: '115px', paddingBottom: 5}});
    }

    createDropdown(config) {
        const options = config.fieldSpec.lookupValues,
            handler = this[config.field + 'Handler'] || this.createHandler(config.field, 'onValueChange');

        // 'hack' to allow additions(not built in), overrides itemPredicate, see note above handleAdditions function
        const itemListPredicate = config.editor.allowAdditions ? this.handleAdditions : null;

        return suggest({
            className: 'rest-form-dropdown-blueprint',
            popoverProps: {popoverClassName: Classes.MINIMAL},
            itemListPredicate: itemListPredicate,
            itemPredicate: (q, v, index) => !v || v.includes(q),
            style: {marginBottom: 5},
            $items: options,
            onItemSelect: handler,
            itemRenderer: ({handleClick, isActive, item}) => {
                return menuItem({key: item, onClick: handleClick, text: item});
            },
            inputValueRenderer: s => s,
            inputProps: { // TODO: still allowing additions without adding to the drop down.
                defaultValue: config.defaultValue,
                // TODO need to somehow set current value on visible component
                value: undefined, // console warning dictated this undefined if I want to use default val
                rightElement: icon({iconName: 'pt-icon-caret-down'}),
                disabled: config.isDisabled
            }
        });
    }

    createBooleanDropdown(config) {
        const currentText = config.defaultValue.toString(),
            handler = this[config.field + 'Handler'] || this.createHandler(config.field, 'onBoolChange');

        return select({
            className: 'rest-form-dropdown-blueprint',
            popoverProps: {popoverClassName: Classes.MINIMAL},
            filterable: false,
            $items: ['true', 'false'],
            items: button({text: currentText, rightIconName: 'caret-down', style: {marginBottom: 5}}),
            onItemSelect: handler,
            itemRenderer: ({handleClick, isActive, item}) => {
                return menuItem({key: item, onClick: handleClick, text: item});
            },
            disabled: config.isDisabled
        });
    }

    createNumberInput(config) {
        const handler = this[config.field + 'Handler'] || this.createHandler(config.field, 'onValueChange');
        return numericInput({
            style: {marginBottom: 5},
            value: config.defaultValue,
            onValueChange: handler,
            disabled: config.isDisabled
        });
    }

    createTextAreaInput(config) {
        const handler = this[config.field + 'Handler'] || this.createHandler(config.field, 'onValueChange');
        return textArea({
            style: {marginBottom: 5},
            defaultValue: config.defaultValue,
            onChange: handler,
            disabled: config.isDisabled,
            model: this.model
        });
    }

    createTextInput(config) {
        const handler = this[config.field + 'Handler'] || this.createHandler(config.field, 'onValueChange');
        return inputGroup({
            defaultValue: config.defaultValue,
            className: `xhField-${config.field}`,
            onChange: handler,
            type: 'text',
            style: {marginBottom: 5},
            disabled: config.isDisabled
        });
    }

    //  one problem is this fires on each keystroke, makes for a funky list of choices, ie: n, ne, new
    handleAdditions(query, list, index) {
        if (query && !list.includes(query)) list.push(query);
        const ret = list.filter(it => it.includes(query));
        return query ? ret : list;
    }

    onValueChange = (value, field) => {
        const {setFormValue} = this.model;
        setFormValue(field, value);
    }

    onBoolChange = (value, field) => {
        const {setFormValue} = this.model;
        setFormValue(field, value === 'true');
    }

    getInputConfig(fieldSpec, editor, formRecord) {
        const renderer = editor.renderer,
            currentValue = formRecord[fieldSpec.name],
            defaultValue = renderer ? renderer(currentValue) : currentValue,
            isDisabled = fieldSpec.readOnly || (editor.additionsOnly && !this.model.formIsAdd);

        return {
            editor: editor,
            fieldSpec: fieldSpec,
            field: fieldSpec.name,
            defaultValue: defaultValue,
            isDisabled: isDisabled
        };
    }

    getInputType(fieldSpec, editor) {
        if (fieldSpec.lookupValues) return 'dropdown';
        if (fieldSpec.type === 'bool' || fieldSpec.type === 'boolean') return 'boolean';
        if (fieldSpec.type === 'int') return 'number';
        if (editor.type === 'textarea' || fieldSpec.type === 'json') return 'textarea';
        return 'text';
    }

    createHandler(field, handlerName) {
        const handler = (valOrEvent) => {
            const val = (typeof valOrEvent === 'object') ? valOrEvent.target.value : valOrEvent;
            this[handlerName](val, field);
        };
        this[field + 'Handler'] = handler;
        return handler;
    }
}
export const restFormBlueprint = elemFactory(RestFormBlueprint);