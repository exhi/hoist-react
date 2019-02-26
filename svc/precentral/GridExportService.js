/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, HoistService} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {throwIf} from '@xh/hoist/utils/js';
import download from 'downloadjs';
import {isFunction, isString} from 'lodash';

import {BaseGridExportService} from '../BaseGridExportService';

@HoistService
export class GridExportService extends BaseGridExportService {
    async exportAsync(gridModel, {
        filename = 'export',
        type = 'excelTable',
        includeHiddenCols = false
    } = {}) {
        throwIf(!gridModel, 'GridModel required for export');
        throwIf(!isString(filename) && !isFunction(filename), 'Export filename must be either a string or a closure');
        throwIf(!['excel', 'excelTable', 'csv'].includes(type), `Invalid export type "${type}". Must be either "excel", "excelTable" or "csv"`);

        if (isFunction(filename)) filename = filename(gridModel);

        const columns = this.getExportableColumns(gridModel, includeHiddenCols),
            records = gridModel.store.rootRecords,
            meta = this.getColumnMetadata(columns),
            rows = [];

        if (records.length === 0) {
            XH.toast({message: 'No data found to export', intent: 'danger', icon: Icon.warning()});
            return;
        }

        rows.push(this.getHeaderRow(columns, type));
        rows.push(...this.getRecordRowsRecursive(gridModel, records, columns, 0));

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
}
