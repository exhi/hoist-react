/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {recordActionBar} from '@xh/hoist/desktop/cmp/record';

export const actionCol = {
    colId: 'actions',
    headerName: null,
    align: 'center',
    width: 52,
    sortable: false,
    resizable: false,
    chooserName: 'Actions',
    chooserDescription: 'Record Actions',
    excludeFromExport: true,
    elementRenderer: (value, {column, ...rest}) => recordActionBar({actions: column.actions, showOnHover: column.actionsShowOnHover, ...rest})
};