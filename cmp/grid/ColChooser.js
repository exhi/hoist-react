/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {filler} from '@xh/hoist/cmp/layout';
import {toolbar} from '@xh/hoist/cmp/toolbar';
import {leftRightChooser} from '@xh/hoist/cmp/leftrightchooser';
import {button, dialog} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';

@HoistComponent()
export class ColChooser extends Component {

    render() {
        const {isOpen, lrModel} = this.model;

        if (!isOpen) return null;

        return dialog({
            icon: Icon.grid(),
            title: 'Choose Columns',
            cls: 'xh-grid-column-chooser',
            isOpen: true,
            onClose: this.onClose,
            items: [
                leftRightChooser({model: lrModel, height: 300}),
                toolbar(
                    filler(),
                    button({
                        text: 'Cancel',
                        onClick: this.onClose
                    }),
                    button({
                        text: 'Save',
                        icon: Icon.check({cls: 'xh-green'}),
                        onClick: this.onOK
                    })
                )
            ]});
    }

    onClose = () => {this.model.close()};

    onOK = () => {
        this.model.commit();
        this.onClose();
    }

}
export const colChooser = elemFactory(ColChooser);