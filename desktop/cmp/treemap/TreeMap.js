/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {Highcharts, highchartsExporting, highchartsOfflineExporting, highchartsExportData, highchartsTree, highchartsHeatmap} from '@xh/hoist/kit/highcharts';

import {XH, elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {div, box} from '@xh/hoist/cmp/layout';
import {Ref} from '@xh/hoist/utils/react';
import {resizeSensor} from '@xh/hoist/kit/blueprint';
import {fmtNumber} from '@xh/hoist/format';
import {assign, merge, clone} from 'lodash';

import {LightTheme} from './theme/Light';
import {DarkTheme} from './theme/Dark';

import './TreeMap.scss';
import {TreeMapModel} from './TreeMapModel';

highchartsExporting(Highcharts);
highchartsOfflineExporting(Highcharts);
highchartsExportData(Highcharts);
highchartsTree(Highcharts);
highchartsHeatmap(Highcharts);

/**
 * Todo
 */
@HoistComponent
@LayoutSupport
export class TreeMap extends Component {

    static propTypes = {
        /** Primary component model instance. */
        model: PT.oneOfType([PT.instanceOf(TreeMapModel), PT.object]).isRequired
    };

    static modelClass = TreeMapModel;

    baseClassName = 'xh-treemap';

    _chartElem = new Ref();
    _chart = null;

    render() {
        // Default flex = 1 (flex: 1 1 0) if no dimensions / flex specified, i.e. do not consult child for dimensions;
        const layoutProps = this.getLayoutProps();

        if (layoutProps.width == null && layoutProps.height == null && layoutProps.flex == null) {
            layoutProps.flex = 1;
        }

        this.renderHighChart();

        // Inner div required to be the ref for the chart element
        return resizeSensor({
            onResize: (e) => this.resizeChart(e),
            item: box({
                ...layoutProps,
                className: this.getClassName(),
                item: div({
                    style: {margin: 'auto'},
                    ref: this._chartElem.ref
                })
            })
        });
    }

    //-------------------
    // Implementation
    //-------------------
    renderHighChart() {
        this.destroyHighChart();
        const chartElem = this._chartElem.value;
        if (chartElem) {
            const config = this.getMergedConfig(),
                parentEl = chartElem.parentElement;

            assign(config.chart, {
                width: parentEl.offsetWidth,
                height: parentEl.offsetHeight
            });

            config.chart.renderTo = chartElem;
            this._chart = Highcharts.chart(config);
        }
    }

    resizeChart(e) {
        const {width, height} = e[0].contentRect;
        this._chart.setSize(width, height, false);
    }

    destroy() {
        this.destroyHighChart();
    }

    destroyHighChart() {
        XH.safeDestroy(this._chart);
        this._chart = null;
    }

    //----------------------
    // Highcharts Config
    //----------------------
    getMergedConfig() {
        const defaultConf = this.getDefaultConfig(),
            themeConf = this.getThemeConfig(),
            propsConf = this.getModelConfig();

        return merge(defaultConf, themeConf, propsConf);
    }

    getDefaultConfig() {
        const exporting = {
            enabled: false,
            fallbackToExportServer: false,
            chartOptions: {
                scrollbar: {enabled: false}
            },
            buttons: {
                contextButton: {
                    menuItems: ['downloadPNG', 'downloadSVG', 'separator', 'downloadCSV']
                }
            }
        };

        return {
            chart: {margin: false},
            credits: false,
            title: false,
            legend: {enabled: false},
            exporting
        };
    }

    getThemeConfig() {
        return XH.darkTheme ? clone(DarkTheme) : clone(LightTheme);
    }

    getModelConfig() {
        const {config, data, algorithm, tooltip} = this.model,
            {defaultTooltip} = this;

        return {
            ...config,
            tooltip: {
                enabled: !!tooltip,
                useHTML: true,
                padding: 0,
                shape: 'square',
                shadow: false,
                pointFormatter: function() {
                    if (!tooltip) return;
                    const {record} = this;
                    return tooltip == true ? defaultTooltip(record) : tooltip(record);
                }
            },
            series: [{
                data,
                type: 'treemap',
                animation: false,
                layoutAlgorithm: algorithm
            }]
        };
    }

    defaultTooltip = (record) => {
        const {labelField, valueField, heatField, valueFieldLabel, heatFieldLabel} = this.model,
            value = record[valueField],
            name = record[labelField],
            heat = record[heatField];

        return `
            <div class="xh-treemap-tooltip">
                <div class="xh-treemap-tooltip__label">${name}</div>
                <div class="xh-treemap-tooltip__row">
                    <div>${valueFieldLabel || valueField}:</div>
                    <div>${fmtNumber(value)}</div>
                </div>
                <div class="xh-treemap-tooltip__row">
                    <div>${heatFieldLabel || heatField}:</div>
                    <div>${fmtNumber(heat)}</div>
                </div>
            </div>
        `;
    };
}

export const treeMap = elemFactory(TreeMap);