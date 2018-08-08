/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {startCase} from 'lodash';
import {ExportFormat} from './ExportFormat';
import {withDefault, withDefaultTrue, withDefaultFalse, throwIf} from '@xh/hoist/utils/JsUtils';

/**
 * Definition of display and other meta-data for a grid column.
 */
export class Column {

    /**
     * Create a new column.
     */
    constructor({
        field,
        colId,
        headerName,
        hide,
        align,
        width,
        minWidth,
        maxWidth,
        flex,
        resizable,
        format,
        renderer,
        elementRenderer,
        chooserName,
        chooserGroup,
        chooserDescription,
        excludeFromChooser,
        exportName,
        exportValue,
        exportFormat,
        excludeFromExport,
        agOptions
    }) {

        this.field = field;
        this.colId = withDefault(colId, field);
        throwIf(!this.colId, 'Must specify colId or field in Column.');

        this.headerName = withDefault(headerName, startCase(this.colId));
        this.hide = withDefaultFalse(hide);
        this.align = align;
        this.width = width;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.flex = withDefaultFalse(flex);
        this.resizable = withDefaultTrue(resizable);

        this.renderer = renderer;
        this.elementRenderer = elementRenderer;

        this.chooserName = chooserName || this.headerName || this.colId;
        this.chooserGroup = chooserGroup;
        this.chooserDescription = chooserDescription;
        this.excludeFromChooser = withDefaultFalse(excludeFromChooser, false);

        this.exportName = exportName || this.headerName || this.colId;
        this.exportValue = exportValue;
        this.exportFormat = withDefault(exportFormat, ExportFormat.DEFAULT);
        this.excludeFromExport = withDefault(excludeFromExport, !field);

        this.agOptions = agOptions;
    }


    /**
     * Produce a Column definition appropriate for AG Grid.
     */
    getAgSpec() {

        const ret = {
            field: this.field,
            colId: this.colId,
            headerName: this.headerName,
            hide: this.hide,
            minWidth: this.minWidth,
            maxWidth: this.maxWidth,
            ...this.agOptions
        };

        const {align} = this;
        if (align === 'center' || align === 'right') {
            ret.headerClass = ret.headerClass || [];
            ret.cellClass = ret.cellClass || [];
            ret.headerClass.push('xh-column-header-align-'+align);
            ret.cellClass.push('xh-align-'+align);
        }

        if (this.flex) {
            ret.suppressResize = true;
            ret.width = Number.MAX_SAFE_INTEGER;
        } else {
            ret.suppressSizeToFit = true;
            ret.width = this.width || 0;
        }

        if (!this.resizable) {
            ret.suppressResize = true;
        }

        const {renderer, elementRenderer} = this;
        if (renderer) {
            ret.cellRenderer = (params) => renderer(params.value, params.data);
        } else if (elementRenderer) {
            ret.cellRendererFramework = class extends Component {
                render() {return elementRenderer(this.props)}
                refresh() {return false}
            };
        }
        
        return ret;
    }
}