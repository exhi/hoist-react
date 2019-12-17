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
import {toolbarSep} from '@xh/hoist/desktop/cmp/toolbar';
import {storeFilterField} from '@xh/hoist/cmp/store';
import {switchInput} from '@xh/hoist/desktop/cmp/input';
import {exportButton} from '@xh/hoist/desktop/cmp/button';

import {UserModel} from './UserModel';

export const UserPanel = hoistCmp({
    model: creates(UserModel),

    render() {
        return panel({
            mask: 'onLoad',
            tbar: [
                switchInput({
                    bind: 'activeOnly',
                    label: 'Active only'
                }),
                toolbarSep(),
                switchInput({
                    bind: 'withRolesOnly',
                    label: 'With roles only'
                }),
                filler(),
                gridCountLabel({unit: 'user'}),
                storeFilterField(),
                exportButton()
            ],
            item: grid()
        });
    }
});
