/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {fragment, frame, hframe, vframe} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {compact, uniq} from 'lodash';
import PT from 'prop-types';
import React from 'react';
import {SplitTreeMapModel} from './SplitTreeMapModel';
import {treeMap} from './TreeMap';

/**
 * A component which divides data across two TreeMaps.
 *
 * @see SplitTreeMapModel
 */
export const [SplitTreeMap, splitTreeMap]  = hoistCmp.withFactory({
    displayName: 'SplitTreeMap',
    model: uses(SplitTreeMapModel),
    className: 'xh-split-treemap',

    render({model, ...props}, ref) {
        const {primaryMapModel, secondaryMapModel, orientation} = model,
            errors = uniq(compact([primaryMapModel.error, secondaryMapModel.error])),
            container = orientation === 'horizontal' ? hframe : vframe;

        return container({
            ref,
            items: errors.length ? errorPanel({errors}) : childMaps(),
            ...props
        });
    }
});
SplitTreeMap.propTypes = {
    /** Primary component model instance. */
    model: PT.oneOfType([PT.instanceOf(SplitTreeMapModel), PT.object])
};


const childMaps = hoistCmp.factory(
    ({model}) => {
        const {primaryMapModel, secondaryMapModel, mapTitleFn} = model,
            pTotal = primaryMapModel.total,
            sTotal = secondaryMapModel.total;

        let pFlex = 1, sFlex = 1;
        if (pTotal && sTotal) {
            // pFlex value is rounded to limit the precision of our flex config and avoid extra
            // render cycles due to imperceptible changes in the ratio between the sides.
            pFlex = (pTotal / sTotal).toFixed(2);
        } else if (pTotal && !sTotal) {
            sFlex = 0;
        } else if (!pTotal && sTotal) {
            pFlex = 0;
        }

        return fragment([
            panel({
                title: mapTitleFn ? mapTitleFn(primaryMapModel, true) : undefined,
                compactHeader: true,
                item: treeMap({model: primaryMapModel}),
                flex: pFlex
            }),
            panel({
                title: mapTitleFn ? mapTitleFn(secondaryMapModel, false) : undefined,
                compactHeader: true,
                item: treeMap({model: secondaryMapModel}),
                flex: sFlex
            })
        ]);
    }
);

const errorPanel = hoistCmp.factory(
    ({errors}) => frame({
        className: 'xh-split-treemap__error-message',
        items: errors.map(e => <p>{e}</p>)
    })
);
