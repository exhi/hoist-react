/*
* This file belongs to Hoist, an application development toolkit
* developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
*
* Copyright © 2019 Extremely Heavy Industries Inc.
*/
import {hoistCmp, creates} from '@xh/hoist/core';
import {grid, gridCountLabel} from '@xh/hoist/cmp/grid';
import {filler} from '@xh/hoist/cmp/layout';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {button, exportButton} from '@xh/hoist/desktop/cmp/button';
import {storeFilterField} from '@xh/hoist/cmp/store';
import {Icon} from '@xh/hoist/icon';

import {EhCacheModel} from './EhCacheModel';

export const EhCachePanel = hoistCmp({

    model: creates(EhCacheModel),

    render({model}) {
        return panel({
            mask: 'onLoad',
            tbar: [
                button({
                    icon: Icon.reset(),
                    text: 'Clear All',
                    intent: 'danger',
                    onClick: () => model.clearAll()
                }),
                filler(),
                gridCountLabel({unit: 'cache'}),
                storeFilterField(),
                exportButton()
            ],
            item: grid()
        });
    }
});
