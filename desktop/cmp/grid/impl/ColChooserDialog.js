/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {dialog} from '@xh/hoist/kit/blueprint';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';

import {colChooser} from './ColChooser';
import {ColChooserModel} from './ColChooserModel';

@HoistComponent
export class ColChooserDialog extends Component {

    static modelClass = ColChooserModel;

    baseClassName = 'xh-col-chooser-dialog';

    render() {
        const {model} = this;
        if (!model.isOpen) return null;

        return dialog({
            icon: Icon.gridPanel(),
            title: 'Choose Columns',
            isOpen: true,
            onClose: this.onClose,
            item: colChooser({model}),
            className: this.getClassName()
        });
    }

    onClose = () => {this.model.close()};

}

export const colChooserDialog = elemFactory(ColChooserDialog);