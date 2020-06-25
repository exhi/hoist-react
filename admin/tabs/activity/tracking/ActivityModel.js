/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {usernameCol} from '@xh/hoist/admin/columns';
import {ActivityDetailModel} from '@xh/hoist/admin/tabs/activity/tracking/detail/ActivityDetailModel';
import {DimensionChooserModel} from '@xh/hoist/cmp/dimensionchooser';
import {FormModel} from '@xh/hoist/cmp/form';
import {GridModel} from '@xh/hoist/cmp/grid';
import {HoistModel, LoadSupport, managed, XH} from '@xh/hoist/core';
import {Cube} from '@xh/hoist/data';
import {fmtDate, numberRenderer} from '@xh/hoist/format';
import {wait} from '@xh/hoist/promise';
import {LocalDate} from '@xh/hoist/utils/datetime';
import {isFinite, isPlainObject} from 'lodash';
import {ChildCountAggregator, LeafCountAggregator, RangeAggregator} from '../aggregators';
import {ChartsModel} from './charts/ChartsModel';

export const PERSIST_ACTIVITY = {localStorageKey: 'xhAdminActivityState'};

@HoistModel
@LoadSupport
export class ActivityModel {

    persistWith = PERSIST_ACTIVITY;

    /** @member {FormModel} */
    @managed formModel;
    /** @member {DimensionChooserModel} */
    @managed dimChooserModel;
    /** @member {Cube} */
    @managed cube;
    /** @member {GridModel} */
    @managed gridModel;

    /** @member {ActivityDetailModel} */
    @managed activityDetailModel;
    /** @member {ChartsModel} */
    @managed chartsModel;

    get dimensions() {return this.dimChooserModel.value}

    constructor() {
        this.formModel = new FormModel({
            fields: [
                {name: 'startDate', initialValue: LocalDate.today().subtract(3, 'months')},
                // TODO - see https://github.com/xh/hoist-react/issues/400 for why we add a day below.
                {name: 'endDate', initialValue: LocalDate.today().add(1)},
                {name: 'username', initialValue: ''},
                {name: 'msg', initialValue: ''},
                {name: 'category', initialValue: ''},
                {name: 'device', initialValue: ''},
                {name: 'browser', initialValue: ''}
            ]
        });

        this.cube = new Cube({
            fields: [
                {name: 'day', isDimension: true, aggregator: new RangeAggregator()},
                {name: 'month', isDimension: true, aggregator: 'UNIQUE'},
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
                {name: 'entryCount', aggregator: new LeafCountAggregator()}
            ]
        });

        this.dimChooserModel = new DimensionChooserModel({
            persistWith: this.persistWith,
            enableClear: true,
            dimensions: [
                {label: 'Date', value: 'day'},
                {label: 'Month', value: 'month'},
                {label: 'User', value: 'username'},
                {label: 'Message', value: 'msg'},
                {label: 'Category', value: 'category'},
                {label: 'Device', value: 'device'},
                {label: 'Browser', value: 'browser'},
                {label: 'User Agent', value: 'userAgent'}
            ],
            initialValue: ['day', 'category', 'username']
        });

        this.gridModel = new GridModel({
            treeMode: true,
            persistWith: this.persistWith,
            enableColChooser: true,
            enableExport: true,
            exportOptions: {filename: `${XH.appCode}-activity-summary`},
            emptyText: 'No activity reported...',
            sortBy: ['day|desc', 'cubeLabel'],
            columns: [
                {
                    field: 'cubeLabel',
                    headerName: 'Tracked Activity',
                    flex: 1,
                    minWidth: 100,
                    isTreeColumn: true,
                    renderer: (v, params) => params.record.raw.cubeDimension === 'day' ? fmtDate(v) : v
                },
                {field: 'username', ...usernameCol, hidden: true},
                {field: 'category', width: 100, hidden: true},
                {field: 'device', width: 100, hidden: true},
                {field: 'browser', width: 100, hidden: true},
                {field: 'userAgent', width: 100, hidden: true},
                {field: 'impersonating', width: 140, hidden: true},
                {
                    field: 'elapsed',
                    headerName: 'Elapsed (avg)',
                    width: 130,
                    align: 'right',
                    renderer: numberRenderer({label: 'ms', nullDisplay: '-', formatConfig: {thousandSeparated: false, mantissa: 0}}),
                    hidden: true
                },
                {field: 'entryCount', headerName: 'Entries', width: 70, align: 'right'},
                {
                    field: 'day',
                    width: 200,
                    align: 'right',
                    headerName: 'Date Range',
                    renderer: this.dateRangeRenderer,
                    exportValue: this.dateRangeRenderer,
                    comparator: this.dateRangeComparator
                }
            ]
        });

        this.activityDetailModel = new ActivityDetailModel({parentModel: this});
        this.chartsModel = new ChartsModel({parentModel: this});

        this.addReaction({
            track: () => {
                const vals = this.formModel.values;
                return [
                    vals.startDate, vals.endDate,
                    vals.username, vals.msg, vals.category, vals.device, vals.browser
                ];
            },
            run: () => this.loadAsync(),
            fireImmediately: true,
            debounce: 10
        });

        this.addReaction({
            track: () => [this.cube.records, this.dimensions],
            run: () => this.loadGridAndChartAsync(),
            debounce: 100
        });
    }

    async doLoadAsync(loadSpec) {
        const {cube, formModel} = this;
        try {
            const data = await XH.fetchJson({
                url: 'trackLogAdmin',
                params: formModel.getData(),
                loadSpec
            });

            data.forEach(it => {
                it.day = LocalDate.from(it.dateCreated);
                it.month = it.day.format('MMM YYYY');
            });

            await cube.loadDataAsync(data);
        } catch (e) {
            await cube.clearAsync();
            XH.handleException(e);
        }
    }

    async loadGridAndChartAsync() {
        const {cube, gridModel, chartsModel, dimensions} = this,
            data = cube.executeQuery({dimensions, includeLeaves: true});

        data.forEach(node => this.separateLeafRows(node));
        gridModel.loadData(data);

        await wait(1);
        if (!gridModel.hasSelection) gridModel.selectFirst();

        chartsModel.setDataAndDims({data, dimensions});
    }

    // Cube emits leaves in "children" collection - rename that collection to "leafRows" so we can
    // carry the leaves with the record, but deliberately not show them in the tree grid. We only
    // want the tree grid to show aggregate records.
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

    toggleRowExpandCollapse(agParams) {
        const {data, node} = agParams;
        if (data?.children && node) node.setExpanded(!node.expanded);
    }

    dateRangeRenderer(range) {
        if (!range) return;
        if (isFinite(range)) return fmtDate(range);

        const {min, max} = range,
            minStr = fmtDate(min),
            maxStr = fmtDate(max);

        if (minStr === maxStr) return minStr;
        return `${minStr} → ${maxStr}`;
    }

    dateRangeComparator(rangeA, rangeB, sortDir, abs, {defaultComparator}) {
        if (!isPlainObject(rangeA)) console.log(rangeA);
        if (!isPlainObject(rangeB)) console.log(rangeB);
        const maxA = rangeA?.max,
            maxB = rangeB?.max;

        return defaultComparator(maxA, maxB);
    }

}