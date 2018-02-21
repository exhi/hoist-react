/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory} from 'hoist/react';
import {observer} from 'hoist/mobx';
import {hbox} from 'hoist/layout';
import {button} from 'hoist/kit/blueprint';

@observer
export class RestGridToolbar extends Component {

    render() {
        const model = this.model,
            singleRecord = model.selection.singleRecord,
            actionEnabled = model.actionEnabled;

        return hbox({
            cls: 'xh-tbar',
            itemSpec: {
                factory: button,
                cls: 'xh-mr'
            },
            items: [
                {
                    text: 'Add',
                    icon: 'add',
                    intent: 'success',
                    onClick: this.onAddClick,
                    omit: !actionEnabled.add
                },
                {
                    text: 'Edit',
                    icon: 'edit',
                    onClick: this.onEditClick,
                    disabled: !singleRecord,
                    omit: !actionEnabled.edit
                },
                {
                    text: 'Delete',
                    icon: 'delete',
                    intent: 'danger',
                    onClick: this.onDeleteClick,
                    disabled: !singleRecord,
                    omit: !actionEnabled.del
                }
            ]
        });
    }

    //-----------------------------
    // Implementation
    //-----------------------------
    get model() {return this.props.model}

    onAddClick = () => {
        this.model.addRecord();
    }

    onEditClick = () => {
        this.model.editSelection();
    }

    onDeleteClick = () => {
        const model = this.model,
            warning = model.actionWarning.del;
        if (warning) {
            model.confirmModel.show({
                message: warning,
                onConfirm: () => model.deleteSelection()
            });
        } else {
            model.deleteSelection();
        }
    }
}
export const restGridToolbar = elemFactory(RestGridToolbar);
