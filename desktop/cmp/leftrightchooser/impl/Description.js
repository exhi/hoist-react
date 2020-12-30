/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {hoistCmp} from '@xh/hoist/core';
import {callout} from '@xh/hoist/kit/blueprint';

/** @private */
export const description = hoistCmp.factory(
    ({model}) => {
        const {hasDescription, leftModel, rightModel} = model,
            selected = leftModel.selectedRecord || rightModel.selectedRecord;

        if (!hasDescription || !(selected && selected.data.description)) return null;

        return callout({
            title: selected.data.text,
            className: 'xh-lr-chooser__description',
            intent: 'primary',
            icon: null,
            item: selected.data.description
        });
    }
);
