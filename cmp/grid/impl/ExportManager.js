/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {fmtDate} from '@xh/hoist/format';
import {Icon} from '@xh/hoist/icon';
import {throwIf} from '@xh/hoist/utils/js';
import {ExportFormat} from '@xh/hoist/columns';
import {orderBy, uniq, isString, isFunction} from 'lodash';
import download from 'downloadjs';

/**
 * Exports Grid data to either Excel or CSV via Hoist's server-side export capabilities.
 * @see HoistColumn API for options to control exported values and formats.
 *
 * It is not necessary to manually create instances of this class within an application.
 * @private
 */
export class ExportManager {

    /**
     * Export a GridModel to a file. Typically called via `GridModel.export()`.
     *
     * @param {GridModel} gridModel - GridModel to export.
     * @param {(string|function)} filename - name for exported file or closure to generate.
     * @param {string} type - type of export - one of ['excel', 'excelTable', 'csv'].
     */
    async exportAsync(gridModel, filename, type) {
        throwIf(!gridModel, 'GridModel required for export');
        throwIf(!isString(filename) && !isFunction(filename), 'Export filename must be either a string or a closure');
        throwIf(!['excel', 'excelTable', 'csv'].includes(type), `Invalid export type "${type}". Must be either "excel", "excelTable" or "csv"`);

        if (isFunction(filename)) filename = filename(gridModel);

        const {store, sortBy} = gridModel,
            columns = gridModel.getLeafColumns(),
            sortColIds = sortBy.map(it => it.colId),
            sorts = sortBy.map(it => it.sort),
            records = orderBy(store.records, sortColIds, sorts),
            meta = this.getColumnMetadata(columns),
            rows = [];

        if (records.length === 0) {
            XH.toast({message: 'No data found to export', intent: 'danger', icon: Icon.warning()});
            return;
        }

        rows.push(this.getHeaderRow(columns, type));
        records.forEach(record => {
            rows.push(this.getRecordRow(record, columns));
        });

        // Show separate 'started' and 'complete' toasts for larger (i.e. slower) exports.
        // We use cell count as a heuristic for speed - this may need to be tweaked.
        if (rows.length * columns.length > 5000) {
            XH.toast({
                message: 'Your export is being prepared and will download shortly...',
                intent: 'primary',
                icon: Icon.download()
            });
        }

        const response = await XH.fetch({
            url: 'xh/export',
            params: {
                filename: filename,
                filetype: type,
                meta: JSON.stringify(meta),
                rows: JSON.stringify(rows)
            }
        });

        const blob = response.status === 204 ? null : await response.blob();
        download(blob, filename);
        XH.toast({
            message: 'Export complete',
            intent: 'success'
        });
    }


    //-----------------------
    // Implementation
    //-----------------------
    getColumnMetadata(columns) {
        return this.getExportableColumns(columns)
            .map(column => {
                const {field, exportFormat, exportWidth: width} = column;
                let type = null;
                if (exportFormat === ExportFormat.DATE_FMT) type = 'date';
                if (exportFormat === ExportFormat.DATETIME_FMT) type = 'datetime';
                if (exportFormat === ExportFormat.LONG_TEXT) type = 'longText';

                return {field, type, format: exportFormat, width};
            });
    }

    getHeaderRow(columns, type) {
        const headers = this.getExportableColumns(columns)
            .map(it => it.exportName);
        if (type === 'excelTable' && uniq(headers).length !== headers.length) {
            console.warn('Excel tables require unique headers on each column. Consider using the "exportName" property to ensure unique headers.');
        }
        return {data: headers, depth: 0};
    }

    getRecordRow(record, columns) {
        const data = this.getExportableColumns(columns)
            .map(it => this.getCellData(record, it));
        return {data, depth: 0};
    }

    getExportableColumns(columns) {
        return columns.filter(it => !it.excludeFromExport);
    }

    getCellData(record, column) {
        const {field, exportValue, exportFormat} = column;

        // Modify value using exportValue
        let value = record[field];
        if (isString(exportValue) && record[exportValue] !== null) {
            // If exportValue points to a different field
            value = record[exportValue];
        } else if (isFunction(exportValue)) {
            // If export value is a function that transforms the value
            value = exportValue(value);
        }

        if (value === null) return null;

        // Enforce date formats expected by server
        if (exportFormat === ExportFormat.DATE_FMT) value = fmtDate(value);
        if (exportFormat === ExportFormat.DATETIME_FMT) value = fmtDate(value, 'YYYY-MM-DD HH:mm:ss');

        return value.toString();
    }
}