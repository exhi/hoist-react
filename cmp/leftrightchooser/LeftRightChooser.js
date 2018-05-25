/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {vbox, hframe} from '@xh/hoist/cmp/layout';
import {grid} from '@xh/hoist/cmp/grid';

import {description} from './impl/Description';
import {chooserToolbar} from './impl/ChooserToolbar';
import './LeftRightChooser.scss';

/**
 * A component for moving a list of items between two arbitrary groups. By convention, the left
 * group represents 'available' items and the right group represents 'selected' items.
 * A nested panel is also available to display a more in-depth description for any selected item.
 * @see LeftRightChooserModel
 */
@HoistComponent({layoutSupport: true})
class LeftRightChooser extends Component {

    render() {
        const {model} = this,
            {layoutConfig} = this.props,
            {leftModel, rightModel} = model,
            agOptions = {
                rowSelection: 'multiple',
                rowDeselection: true,
                enableColResize: false,
                onRowDoubleClicked: (e) => model.moveRows([e.data])
            };

        return vbox({
            layoutConfig,
            cls: 'xh-lr-chooser',
            items: [
                hframe({
                    cls: 'xh-lr-chooser__grid-frame',
                    items: [
                        grid({model: leftModel, flex: 'auto', agOptions}),
                        chooserToolbar({model}),
                        grid({model: rightModel, flex: 'auto', agOptions})
                    ]
                }),
                description({model})
            ]
        });
    }
}
export const leftRightChooser = elemFactory(LeftRightChooser);