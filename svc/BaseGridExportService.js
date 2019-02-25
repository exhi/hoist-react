/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH} from '@xh/hoist/core';
import {ExportFormat} from '@xh/hoist/cmp/grid';
import {fmtDate} from '@xh/hoist/format';
import {Icon} from '@xh/hoist/icon';
import {throwIf} from '@xh/hoist/utils/js';
import download from 'downloadjs';
import {isFunction, isNil, isString, orderBy, uniq} from 'lodash';

/**
 * Exports Grid data to either Excel or CSV via Hoist's server-side export capabilities.
 * @see HoistColumn API for options to control exported values and formats.
 */
export class BaseGridExportService {

    /**
     * Export a GridModel to a file.
     *
     * @param {GridModel} gridModel - GridModel to export.
     * @param {Object} [options] - Export options.
     * @param {(string|function)} [options.filename] - name for the exported file, or a closure to generate.
     *      Do not include the file extension - that will be appended based on the specified type.
     * @param {string} [options.type] - type of export - one of ['excel', 'excelTable', 'csv'].
     * @param {boolean} [options.includeHiddenCols] - include hidden grid columns in the export.
     */
    async exportAsync(gridModel, {
        filename = 'export',
        type = 'excelTable',
        includeHiddenCols = false
    } = {}) {}

    //-----------------------
    // Implementation
    //-----------------------
    getExportableColumns(gridModel, includeHiddenColumns) {
        return gridModel
            .getLeafColumns()
            .filter(col => {
                return (
                    !col.excludeFromExport &&
                    (includeHiddenColumns || gridModel.isColumnVisible(col.colId))
                );
            });
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

    getRecordRowsRecursive(gridModel, records, columns, depth) {
        const {sortBy, treeMode} = gridModel,
            sortColIds = sortBy.map(it => it.colId),
            sorts = sortBy.map(it => it.sort),
            sortedRecords = orderBy(records, sortColIds, sorts),
            ret = [];

        sortedRecords.forEach(record => {
            ret.push(this.getRecordRow(record, columns, depth));
            if (treeMode && record.children.length) {
                ret.push(...this.getRecordRowsRecursive(gridModel, record.children, columns, depth + 1));
            }
        });

        return ret;
    }

    getRecordRow(record, columns, depth) {
        const data = columns.map(it => this.getCellData(record, it));
        return {data, depth};
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
