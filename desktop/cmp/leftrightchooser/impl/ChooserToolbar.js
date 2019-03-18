/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistComponent, useProvidedModel} from '@xh/hoist/core';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {vspacer} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {LeftRightChooserModel} from '../LeftRightChooserModel';


/**
 * A Toolbar for the LeftRightChooser.
 * @private
 */
export const [ChooserToolbar, chooserToolbar] = hoistComponent(props => {
    const model = useProvidedModel(LeftRightChooserModel, props),
        leftSel = model.leftModel.selModel,
        rightSel = model.rightModel.selModel;

    return toolbar({
        width: 50,
        vertical: true,
        className: 'xh-lr-chooser__toolbar',
        items: [
            vspacer(10),
            button({
                icon: Icon.chevronRight(),
                onClick: () => model.moveRows(leftSel.records),
                disabled: leftSel.isEmpty
            }),
            button({
                icon: Icon.chevronLeft(),
                onClick: () => model.moveRows(rightSel.records),
                disabled: rightSel.isEmpty
            })
        ]
    });
});
