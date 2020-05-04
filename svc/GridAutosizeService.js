/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {HoistService} from '@xh/hoist/core';
import {throwIf, stripTags} from '@xh/hoist/utils/js';
import {isFunction, isNil, isFinite, sortBy, reduce} from 'lodash';

@HoistService
export class GridAutosizeService {

    _canvasContext;
    _cellEl;

    autoSizeColumns({gridModel, colIds = []}) {
        throwIf(!gridModel, 'GridModel required for autosize');
        if (!colIds.length) return;

        const ret = [];
        for (let i = 0; i < colIds.length; i++) {
            const colId = colIds[i],
                width = this.autoSizeColumn({colId, gridModel});

            if (isFinite(width)) ret.push({colId, width});
        }
        return ret;
    }

    //------------------
    // Implementation
    //------------------
    autoSizeColumn({colId, gridModel}) {
        try {
            const {store} = gridModel,
                records = [...store.records, store.summaryRecord],
                column = gridModel.findColumn(gridModel.columns, colId),
                {autoSizeOptions, field, getValueFn, renderer, elementRenderer} = column,
                {enabled, sampleCount, buffer, minWidth, maxWidth} = autoSizeOptions,
                useRenderer = isFunction(renderer);

            if (!enabled) return;

            // Columns with element renderers are not supported
            if (elementRenderer) return;

            // 1) Get unique values
            const values = new Set();
            records.forEach(record => {
                if (!record) return;
                const rawValue = getValueFn({record, field, column, gridModel}),
                    value = useRenderer ? renderer(rawValue, {record, column, gridModel}) : rawValue;
                values.add(value);
            });

            // 2) Use a canvas to estimate and sort by the pixel width of the string value.
            // Strip html tags but include parentheses / units etc. for renderers that may return html,
            const sortedValues = sortBy(Array.from(values), value => {
                return isNil(value) ? 0 : this.getStringWidth(stripTags(value.toString()));
            });

            // 3) Extract the sample set of longest values for rendering and sizing
            const longestValues = sortedValues.slice(Math.max(sortedValues.length - sampleCount, 0));

            // 4) Render to a hidden cell to calculate the max displayed width
            const result = reduce(longestValues, (currMax, value) => {
                const width = this.getCellWidth(value, useRenderer) + buffer;
                return Math.max(currMax, width);
            }, 0);

            if (isFinite(minWidth) && result < minWidth) return minWidth;
            if (isFinite(maxWidth) && result > maxWidth) return maxWidth;
            return result;
        } catch (e) {
            console.debug(`Could not calculate width for column "${colId}".`, e);
        } finally {
            this.setCellElActive(false);
        }
    }

    //------------------
    // Canvas-based width estimation
    //------------------
    getStringWidth(string) {
        const canvasContext = this.getCanvasContext();
        return canvasContext.measureText(string).width;
    }

    getCanvasContext() {
        if (!this._canvasContext) {
            // Create hidden canvas
            const canvasEl = document.createElement('canvas');
            canvasEl.classList.add('xh-grid-autosize-canvas');
            document.body.appendChild(canvasEl);

            // Create context which uses grid fonts
            const canvasContext = canvasEl.getContext('2d');
            canvasContext.font = 'var(--xh-grid-font-size-px) var(--xh-grid-font-family)';
            this._canvasContext = canvasContext;
        }
        return this._canvasContext;
    }

    //------------------
    // Autosize cell for width calculation
    //------------------
    getCellWidth(value, useRenderer) {
        const cellEl = this.getCellEl();
        this.setCellElActive(true);
        if (useRenderer) {
            cellEl.innerHTML = value;
        } else if (cellEl.firstChild?.nodeType === 3) {
            // If we're not rendering html and the cell's first child is already a TextNode,
            // we can update it's data to avoid creating a new TextNode.
            cellEl.firstChild.data = value;
        } else {
            cellEl.innerText = value;
        }
        return Math.ceil(cellEl.clientWidth);
    }

    setCellElActive(active) {
        const cellEl = this.getCellEl();
        if (active) {
            cellEl.classList.add('xh-grid-autosize-cell--active');
        } else {
            cellEl.classList.remove('xh-grid-autosize-cell--active');
        }
    }

    getCellEl() {
        if (!this._cellEl) {
            const cellEl = document.createElement('div');
            cellEl.classList.add('xh-grid-autosize-cell');
            document.body.appendChild(cellEl);
            this._cellEl = cellEl;
        }
        return this._cellEl;
    }

}