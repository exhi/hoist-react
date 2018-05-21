/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {castArray, clone, merge} from 'lodash';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {div, frame} from '@xh/hoist/cmp/layout';
import {Ref} from '@xh/hoist/utils/Ref';
import Highcharts from 'highcharts/highstock';

import {LightTheme} from './theme/Light';
import {DarkTheme} from './theme/Dark';


/**
 * Wrapper Component for a Highcharts chart. Provides basic rendering / lifecycle management
 * as well as configuration and theme defaults. The chart's core configuration should be sourced
 * from a ChartModel prop passed to this component.
 */
@HoistComponent()
export class Chart extends Component {

    _chartElem = new Ref();
    _chart = null;

    render() {
        this.renderHighChart();
        return frame({
            ...this.props,
            item: div({
                style: {flex: 'auto', overflow: 'hidden'},
                ref: this._chartElem.ref
            })
        });
    }


    //-------------------
    // Implementation
    //-------------------
    componentWillUnmount() {
        this.destroyHighChart();
    }

    renderHighChart() {
        this.destroyHighChart();
        const chartElem = this._chartElem.value;
        if (chartElem) {
            const config = this.getMergedConfig();
            config.chart.renderTo = chartElem;
            this._chart = Highcharts.chart(config);
        }
    }

    destroyHighChart() {
        if (this._chart) {
            this._chart.destroy();
        }
    }
    //----------------------
    // Highcharts Config
    //----------------------
    getMergedConfig() {
        const propsConf = this.getModelConfig(),
            themeConf = this.getThemeConfig(),
            defaultConf = this.getDefaultConfig();

        this.mergeAxisConfigs(themeConf, propsConf);
        return merge(defaultConf, themeConf, propsConf);
    }

    getDefaultConfig() {
        const exporting = {
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
            chart: {},
            credits: false,
            exporting
        };
    }

    mergeAxisConfigs(theme, conf) {
        const axisLabels = ['x', 'y', 'z'];
        axisLabels.forEach(lbl => {
            const axis = lbl + 'Axis',
                arr = castArray(conf[axis] || {}),
                defaultAxisConfig = this.getDefaultAxisConfig(axis);

            conf[axis] = arr.map(it => merge({}, defaultAxisConfig, theme[axis], it));
            theme[axis] = null;
        });
    }

    getDefaultAxisConfig(axis) {
        const defaults = {
            xAxis: {
                dateTimeLabelFormats: {
                    day: '%e-%b-%y',
                    week: '%e-%b-%y',
                    month: '%b-%y',
                    year: '%Y'
                },
                events: {
                    setExtremes: this.onSetExtremes
                }
            },
            yAxis: {},
            zAxis: {}
        };

        return defaults[axis];
    }

    getThemeConfig() {
        return XH.darkTheme ? clone(DarkTheme) : clone(LightTheme);
    }

    getModelConfig() {
        return {
            ...this.model.config,
            series: this.model.series
        };
    }

    //---------------------------
    // Handlers
    //---------------------------
    onSetExtremes = () => {

    }
}
export const chart = elemFactory(Chart);