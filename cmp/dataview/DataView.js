/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import PT from 'prop-types';
import {uses, hoistCmp} from '@xh/hoist/core';
import {grid} from '@xh/hoist/cmp/grid';
import {splitLayoutProps} from '@xh/hoist/utils/react';
import {DataViewModel} from './DataViewModel';
import {apiRemoved} from '@xh/hoist/utils/js';

/**
 * A DataView is a specialized version of the Grid component. It displays its data within a
 * single column, using a configured component for rendering each item.
 */
export const [DataView, dataView] = hoistCmp.withFactory({
    displayName: 'DataView',
    model: uses(DataViewModel),
    className: 'xh-data-view',

    render({model, className, ...props}) {
        apiRemoved(props.itemHeight, 'itemHeight', 'Specify itemHeight on the DataViewModel instead.');

        const [layoutProps, {rowCls, onRowDoubleClicked}] = splitLayoutProps(props);

        return grid({
            ...layoutProps,
            className,
            model: model.gridModel,
            agOptions: {
                headerHeight: 0,
                rowClass: rowCls,
                getRowHeight: () => model.itemHeight
            },
            onRowDoubleClicked
        });
    }
});
DataView.propTypes = {
    /** Primary component model instance. */
    model: PT.oneOfType([PT.instanceOf(DataViewModel), PT.object]),

    /** CSS class used for each row */
    rowCls: PT.string,

    /**
     * Callback to call when a row is double clicked. Function will receive an event
     * with a data node containing the row's data.
     */
    onRowDoubleClicked: PT.func

};