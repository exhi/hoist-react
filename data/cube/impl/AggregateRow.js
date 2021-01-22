/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {has, isEmpty, reduce} from 'lodash';

/**
 *  Object used by views to gather Aggregate rows.
 *
 *  Not intended to be used directly by applications.
 */
export function createAggregateRow(view, id, children, dim, val, appliedDimensions) {
    const data = {};
    data._meta = new AggregateMeta(data, view, id, children, dim, val, appliedDimensions);
    return data;
}

class AggregateMeta {

    view = null;
    dim = null;         // Grouping Dim or null for summary row
    dimName = null;
    children = null;
    parent = null;

    get isLeaf()        {return false}
    get isAggregate()   {return true}

    constructor(data, view, id, children, dim, val, appliedDimensions) {
        const dimName = dim ? dim.name : 'Total';

        this.view = view;
        this.dim = dim;
        this.dimName = dimName;
        this.children = children.map(it => {
            it._meta.parent = this;
            return it._meta;
        });
        this.data = data;

        data.id = id;
        data.cubeLabel = val;
        data.cubeDimension = dimName;

        view.fields.forEach(({name}) => data[name] = null);
        Object.assign(data, appliedDimensions);

        this.markAggFields(val, appliedDimensions);
        this.computeAggregates();
        this.applyVisibleChildren();
    }

    noteBucketed(bucketSpec, bucketVal) {
        this.data.buckets = this.data.buckets ?? {};
        this.data.buckets[bucketSpec.name] = bucketVal;
        this.children.forEach(it => it.noteBucketed(bucketSpec, bucketVal));
    }

    computeAggregates() {
        const {children, canAggregate, view, data} = this;
        view.fields.forEach(({aggregator, name}) => {
            if (canAggregate[name]) {
                data[name] = aggregator.aggregate(children, name);
            }
        });
    }

    applyDataUpdate(childUpdates, updatedRows) {
        const {parent, canAggregate, data, children} = this,
            myUpdates = [];
        childUpdates.forEach(update => {
            const {field} = update,
                {name} = field;
            if (canAggregate[name]) {
                const oldValue = data[name],
                    newValue = field.aggregator.replace(children, oldValue, update);
                if (oldValue !== newValue) {
                    update.oldValue = oldValue;
                    update.newValue = newValue;
                    myUpdates.push(update);
                    data[name] = newValue;
                }
            }
        });

        if (!isEmpty(myUpdates)) {
            updatedRows.add(this.data);
            if (parent) parent.applyDataUpdate(myUpdates, updatedRows);
        }
    }

    //-------------------
    // Implementation
    //-------------------
    markAggFields(val, appliedDimensions) {
        const {dimName, view} = this;

        this.canAggregate = reduce(view.fields, (ret, field) => {
            const {name} = field;
            if (has(appliedDimensions, field)) {
                ret[name] = false;
            } else {
                const {aggregator, canAggregateFn} = field;
                ret[name] = aggregator && (!canAggregateFn || canAggregateFn(dimName, val, appliedDimensions));
            }
            return ret;
        }, {});
    }

    // Process child rows to determine what should be exposed as the actual children in the row data
    applyVisibleChildren() {
        const {children, view, dim, data} = this,
            {lockFn} = view.cube;

        // Remove all children from the data if the query is not configure to include leaves and
        // this row has leaves as children
        if (!view.query.includeLeaves && children[0]?.isLeaf) {
            data.children = null;
            return;
        }

        // Check if we need to 'lock' this row - removing all children from the data so they will not
        // appear in the UI but remain as children of this AggregateMeta to ensure that updates to
        // those child rows will update our aggregate value
        if (lockFn && lockFn(this)) {
            this.locked = true;
            data.children = null;
            return;
        }

        // If we have a single child which is identical to ourselves remove it from the hierarchy
        // since it represents the exact same data as this row
        if (children.length === 1) {
            const childRow = children[0],
                childDim = childRow.dim;

            if (dim && childDim &&
                childDim.parentDimension === dim.name &&
                childRow.data[childDim.name] === data[dim.name]) {
                data.children = childRow.data.children;
                return;
            }
        }

        // If we've gotten past all of the above checks then our data children should consist of
        // all of this row's children
        data.children = children.map(it => it.data);
    }
}
