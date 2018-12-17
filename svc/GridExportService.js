/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistService} from '@xh/hoist/core';
import {ExportFormat} from '@xh/hoist/cmp/grid/columns';
import {fmtDate} from '@xh/hoist/format';
import {Icon} from '@xh/hoist/icon';
import {throwIf} from '@xh/hoist/utils/js';
import download from 'downloadjs';
import {isFunction, isNil, isString, orderBy, uniq} from 'lodash';

/**
 * Exports Grid data to either Excel or CSV via Hoist's server-side export capabilities.
 * @see HoistColumn API for options to control exported values and formats.
 */
@HoistService
export class GridExportService {

    /**
     * Export a GridModel to a file. Typically called via `GridModel.exportAsync()`.
     *
     * @param {GridModel} gridModel - GridModel to export.
     * @param {Object} [options] - Export options.
     * @param {(string|function)} [options.filename] - name for exported file or closure to generate.
     * @param {string} [options.type] - type of export - one of ['excel', 'excelTable', 'csv'].
     * @param {boolean} [options.includeHiddenCols] - include hidden grid columns in the export.
     */
    async exportAsync(gridModel, {
        filename = 'export',
        type = 'excelTable',
        includeHiddenCols = false
    } = {}) {
        throwIf(!gridModel, 'GridModel required for export');
        throwIf(!isString(filename) && !isFunction(filename), 'Export filename must be either a string or a closure');
        throwIf(!['excel', 'excelTable', 'csv'].includes(type), `Invalid export type "${type}". Must be either "excel", "excelTable" or "csv"`);

        if (isFunction(filename)) filename = filename(gridModel);

        const {store, sortBy} = gridModel,
            columns = this.getExportableColumns(gridModel.getLeafColumns(), includeHiddenCols),
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
        if (rows.length * columns.length > 3000) {
            XH.toast({
                message: 'Your export is being prepared and will download when complete...',
                intent: 'primary',
                icon: Icon.download()
            });
        }

        // POST the data as a file (using multipart/form-data) to work around size limits when using application/x-www-form-urlencoded.
        // This allows the data to be split into multiple parts and streamed, allowing for larger excel exports.
        // The content of the "file" is a JSON encoded string, which will be streamed and decoded on the server.
        // Note: It may be necessary to set maxFileSize and maxRequestSize in application.groovy to facilitate very large exports.
        const formData = new FormData(),
            params = {filename, type, meta, rows};

        formData.append('params', JSON.stringify(params));
        const response = await XH.fetch({
            url: 'xh/export',
            method: 'POST',
            body: formData,
            // Note: We must explicitly *not* set Content-Type headers to allow the browser to set it's own multipart/form-data boundary.
            // See https://stanko.github.io/uploading-files-using-fetch-multipart-form-data/ for further explanation.
            headers: new Headers()
        });

        const blob = response.status === 204 ? null : await response.blob(),
            fileExt = this.getFileExtension(type),
            contentType = this.getContentType(type);

        download(blob, `${filename}${fileExt}`, contentType);
        XH.toast({
            message: 'Export complete',
            intent: 'success'
        });
    }

    //-----------------------
    // Implementation
    //-----------------------
    getExportableColumns(columns, includeHiddenColumns) {
        return columns.filter(it => !it.excludeFromExport && (!it.hidden || includeHiddenColumns));
    }

    getColumnMetadata(columns) {
        return columns.map(column => {
            const {field, exportFormat, exportWidth: width} = column;
            let type = null;
            if (exportFormat === ExportFormat.DATE_FMT) type = 'date';
            if (exportFormat === ExportFormat.DATETIME_FMT) type = 'datetime';
            if (exportFormat === ExportFormat.LONG_TEXT) type = 'longText';
            return {field, type, format: exportFormat, width};
        });
    }

    getHeaderRow(columns, type) {
        const headers = columns.map(it => it.exportName);
        if (type === 'excelTable' && uniq(headers).length !== headers.length) {
            console.warn('Excel tables require unique headers on each column. Consider using the "exportName" property to ensure unique headers.');
        }
        return {data: headers, depth: 0};
    }

    getRecordRow(record, columns) {
        const data = columns.map(it => this.getCellData(record, it));
        return {data, depth: 0};
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

        if (isNil(value)) return null;

        // Enforce date formats expected by server
        if (exportFormat === ExportFormat.DATE_FMT) value = fmtDate(value);
        if (exportFormat === ExportFormat.DATETIME_FMT) value = fmtDate(value, 'YYYY-MM-DD HH:mm:ss');

        return value.toString();
    }

    getContentType(type) {
        switch (type) {
            case 'excelTable':
            case 'excel':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'csv':
                return 'text/csv';
        }
    }

    getFileExtension(type) {
        switch (type) {
            case 'excelTable':
            case 'excel':
                return '.xlsx';
            case 'csv':
                return '.csv';
        }
    }
}