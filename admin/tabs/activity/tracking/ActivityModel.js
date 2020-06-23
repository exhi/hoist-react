/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {ActivityDetailModel} from '@xh/hoist/admin/tabs/activity/tracking/detail/ActivityDetailModel';
import {wait} from '@xh/hoist/promise';
import {isEmpty, isFinite} from 'lodash';
import {usernameCol} from '@xh/hoist/admin/columns';
import {dateTimeCol, GridModel} from '@xh/hoist/cmp/grid';
import {HoistModel, LoadSupport, managed, XH} from '@xh/hoist/core';
import {fmtDate, numberRenderer} from '@xh/hoist/format';
import {action, observable} from '@xh/hoist/mobx';
import {LocalDate} from '@xh/hoist/utils/datetime';
import {DimensionChooserModel} from '@xh/hoist/cmp/dimensionchooser';
import {Cube} from '@xh/hoist/data';
import {FormModel} from '@xh/hoist/cmp/form';
import {ChildCountAggregator, LeafCountAggregator, RangeAggregator} from '../aggregators';
import {ChartsModel} from './charts/ChartsModel';

export const PERSIST_ACTIVITY = {localStorageKey: 'xhAdminActivityState'};

@HoistModel
@LoadSupport
export class ActivityModel {

    persistWith = PERSIST_ACTIVITY;

    @observable.ref detailRecord = null;

    @managed
    formModel = new FormModel({
        fields: [
            {name: 'startDate', initialValue: LocalDate.today().subtract(1, 'months')},
            {name: 'endDate', initialValue: LocalDate.today().add(1)},
            {name: 'username', initialValue: ''},
            {name: 'msg', initialValue: ''},
            {name: 'category', initialValue: ''},
            {name: 'device', initialValue: ''},
            {name: 'browser', initialValue: ''}
        ]
    });

    @managed
    dimChooserModel = new DimensionChooserModel({
        persistWith: this.persistWith,
        enableClear: true,
        dimensions: [
            {label: 'Date', value: 'day'},
            {label: 'User', value: 'username'},
            {label: 'Message', value: 'msg'},
            {label: 'Category', value: 'category'},
            {label: 'Device', value: 'device'},
            {label: 'Browser', value: 'browser'},
            {label: 'User Agent', value: 'userAgent'}
        ],
        initialValue: ['day', 'category', 'username']
    });

    @managed
    cube = new Cube({
        fields: [
            {name: 'day', isDimension: true, aggregator: new RangeAggregator()},
            {name: 'username', isDimension: true, aggregator: 'UNIQUE'},
            {name: 'msg', isDimension: true, aggregator: 'UNIQUE'},
            {name: 'category', isDimension: true, aggregator: 'UNIQUE'},
            {name: 'device', isDimension: true, aggregator: 'UNIQUE'},
            {name: 'browser', isDimension: true, aggregator: 'UNIQUE'},
            {name: 'userAgent', isDimension: true, aggregator: 'UNIQUE'},

            {name: 'elapsed', aggregator: 'AVG'},
            {name: 'impersonating'},
            {name: 'dateCreated'},
            {name: 'data'},
            {name: 'count', aggregator: new ChildCountAggregator()},
            {name: 'entryCount', aggregator: new LeafCountAggregator()} // Used for charting, not displayed in grid,
        ]
    });

    @managed
    gridModel = new GridModel({
        treeMode: true,
        persistWith: this.persistWith,
        enableColChooser: true,
        enableExport: true,
        exportOptions: {filename: `${XH.appCode}-activity-summary`},
        emptyText: 'No activity reported...',
        sortBy: 'cubeLabel',
        columns: [
            {
                field: 'cubeLabel',
                headerName: 'Track',
                flex: 1,
                minWidth: 100,
                isTreeColumn: true,
                renderer: (v, params) => params.record.raw.cubeDimension === 'day' ? fmtDate(v) : v
            },
            {field: 'day', width: 200, align: 'right', headerName: 'Day / Range', renderer: this.dateRangeRenderer},
            {field: 'username', ...usernameCol, hidden: true},
            {field: 'category', width: 100, hidden: true},
            {field: 'device', width: 100, hidden: true},
            {field: 'browser', width: 100, hidden: true},
            {field: 'userAgent', width: 100, hidden: true},
            {field: 'impersonating', width: 140, hidden: true},
            {
                field: 'elapsed',
                headerName: 'Elapsed (ms)',
                width: 130,
                align: 'right',
                renderer: numberRenderer({formatConfig: {thousandSeparated: false, mantissa: 0}}),
                hidden: true
            },
            {field: 'count', width: 70, align: 'right'}
        ]
    });

    @managed activityDetailModel;

    @managed chartsModel = new ChartsModel();

    constructor() {
        this.activityDetailModel = new ActivityDetailModel({parentModel: this});

        this.addReaction(this.paramsReaction());
        this.addReaction(this.dimensionsReaction());
        window.AM = this;
    }

    async doLoadAsync(loadSpec) {
        try {
            const data = await XH.fetchJson({
                url: 'trackLogAdmin',
                params: this.formModel.getData(),
                loadSpec
            });

            data.forEach(it => it.day = LocalDate.from(it.dateCreated));
            await this.cube.loadDataAsync(data);
            this.loadGridAndChartAsync();
        } catch (e) {
            this.gridModel.clear();
            this.chartsModel.setDimensions(this.dimChooserModel.value);
            this.chartsModel.setData([]);
            XH.handleException(e);
        }
    }

    async loadGridAndChartAsync() {
        const {dimChooserModel, cube, gridModel, chartsModel} = this,
            dimensions = dimChooserModel.value,
            data = cube.executeQuery({dimensions, includeLeaves: true});

        data.forEach(node => this.separateLeafRows(node));
        gridModel.loadData(data);

        await wait(1);
        if (!gridModel.hasSelection) gridModel.selectFirst();

        chartsModel.setDimensions(dimensions);
        chartsModel.setData(data);
    }

    // Cube emits leaves in "children" collection - rename that collection to "leafRows" so we can
    // carry the leaves with the record, but deliberately not show them in the summary tree grid.
    separateLeafRows(node) {
        if (!node.children) return;

        const childrenAreLeaves = !node.children[0].children;
        if (childrenAreLeaves) {
            node.leafRows = node.children;
            delete node.children;
        } else {
            node.children.forEach((child) => this.separateLeafRows(child));
        }
    }

    adjustDates(dir, toToday = false) {
        const {startDate, endDate} = this.formModel.fields,
            today = LocalDate.today(),
            start = startDate.value,
            end = endDate.value,
            diff = end.diff(start),
            incr = diff + 1;

        let newStart = start[dir](incr),
            newEnd = end[dir](incr);

        if (newEnd.diff(today) > 0 || toToday) {
            newStart = today.subtract(Math.abs(diff));
            newEnd = today;
        }

        startDate.setValue(newStart);
        endDate.setValue(newEnd);
    }

    @action
    expandRowOrOpenDetail(agParams) {
        const rec = agParams.data,
            isLeaf = isEmpty(rec.children);
        if (isLeaf) {
            this.detailRecord = agParams.data;
        } else {
            agParams.node.setExpanded(true);
        }
    }

    @action
    closeDetail() {
        this.detailRecord = null;
    }

    ensureProperTimeseriesChartState(enable) {
        this.chartsModel.setEnableTimeseries(enable);
    }

    //----------------
    // Implementation
    //----------------
    dateRangeRenderer(range) {
        if (!range) return;
        if (isFinite(range)) return fmtDate(range);

        const {min, max} = range,
            minStr = fmtDate(min),
            maxStr = fmtDate(max);

        if (minStr === maxStr) return minStr;
        return `${minStr} – ${maxStr}`;
    }

    paramsReaction() {
        return {
            track: () => {
                const {startDate, endDate, username, msg, category, device, browser} = this.formModel.values;
                return [startDate, endDate, username, msg, category, device, browser];
            },
            run: () => this.loadAsync(),
            fireImmediately: true,
            debounce: 10
        };
    }

    dimensionsReaction() {
        return {
            track: () => this.dimChooserModel.value,
            run: (v) => {
                this.ensureProperTimeseriesChartState(v[0] == 'day');
                this.loadGridAndChartAsync();
            }
        };
    }
}