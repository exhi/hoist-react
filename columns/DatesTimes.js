/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {fileColFactory} from './Utils.js';
import {ExportFormat} from './ExportFormat';
import {dateRenderer, dateTimeRenderer, timeRenderer, compactDateRenderer} from '../format';

const colFactory = fileColFactory({
    cellStyle: {align: 'right'}
});

export const dateCol = colFactory({
    headerName: 'Date',
    valueFormatter: dateRenderer(),
    exportFormat: ExportFormat.DATE_FMT,
    width: 120
});

export const timeCol = colFactory({
    headerName: 'Time',
    valueFormatter: timeRenderer(),
    width: 90
});

export const dateTimeCol = colFactory({
    headerName: 'Date',
    valueFormatter: dateTimeRenderer(),
    exportFormat: ExportFormat.DATETIME_FMT,
    width: 160
});

export const compactDateCol = colFactory({
    headerName: 'Date',
    valueFormatter: compactDateRenderer(),
    exportFormat: ExportFormat.DATE_FMT,
    width: 100
});