/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {ExportFormat} from './ExportFormat';
import {dateRenderer, dateTimeRenderer, timeRenderer, compactDateRenderer, fmtDate} from '@xh/hoist/format';
import {LocalDate} from '@xh/hoist/utils/datetime';

const defaults = {align: 'right'};

export const dateCol = {
    ...defaults,
    renderer: dateRenderer(),
    exportFormat: ExportFormat.DATE_FMT,
    width: 120
};

export const timeCol = {
    ...defaults,
    renderer: timeRenderer(),
    width: 90
};

export const dateTimeCol = {
    ...defaults,
    align: 'left',
    renderer: dateTimeRenderer(),
    exportFormat: ExportFormat.DATETIME_FMT,
    width: 160
};

export const compactDateCol = {
    ...defaults,
    renderer: compactDateRenderer(),
    exportFormat: ExportFormat.DATE_FMT,
    width: 100
};

export const localDateCol = {
    ...defaults,
    renderer: (v) => fmtDate(LocalDate.from(v)),
    exportValue: (v) => LocalDate.from(v).date,
    exportFormat: ExportFormat.DATE_FMT,
    width: 100
};