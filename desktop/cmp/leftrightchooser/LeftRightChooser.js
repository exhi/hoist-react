/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {cloneDeep} from 'lodash';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
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
@HoistComponent
@LayoutSupport
export class LeftRightChooser extends Component {

    baseClassName = 'xh-lr-chooser';

    render() {
        const {model} = this,
            {leftModel, rightModel, leftGroupingExpanded, rightGroupingExpanded} = model,
            gridOptions = {
                onRowDoubleClicked: (e) => model.moveRows([e.data]),
                agOptions: {
                    enableColResize: false
                }
            },
            leftGridOptions = cloneDeep(gridOptions),
            rightGridOptions = cloneDeep(gridOptions);

        if (!leftGroupingExpanded) leftGridOptions.agOptions.groupDefaultExpanded = 0;
        if (!rightGroupingExpanded) rightGridOptions.agOptions.groupDefaultExpanded = 0;

        return vbox({
            ...this.getLayoutProps(),
            className: this.getClassName(),
            items: [
                hframe({
                    className: 'xh-lr-chooser__grid-frame',
                    items: [
                        grid({model: leftModel, ...leftGridOptions}),
                        chooserToolbar({model}),
                        grid({model: rightModel, ...rightGridOptions})
                    ]
                }),
                description({model})
            ]
        });
    }
}
export const leftRightChooser = elemFactory(LeftRightChooser);