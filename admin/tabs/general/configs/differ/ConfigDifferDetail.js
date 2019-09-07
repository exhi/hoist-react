/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {keys, toString} from 'lodash';
import {hoistCmpFactory, useModel} from '@xh/hoist/core';
import {dialog} from '@xh/hoist/kit/blueprint';
import {filler, table, tbody, tr, th, td} from '@xh/hoist/cmp/layout';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

import './Differ.scss';

export const configDifferDetail = hoistCmpFactory(() => {
    const model = useModel().detailModel;
    if (!model.record) return null;

    return dialog({
        title: 'Detail',
        isOpen: model.record,
        onClose: () => model.close(),
        item: panel({
            item: diffTable(),
            bbar: [
                filler(),
                button({
                    text: 'Cancel',
                    onClick: () => model.close()
                }),
                button({
                    text: 'Accept Remote',
                    icon: Icon.cloudDownload(),
                    intent: 'primary',
                    onClick: () => model.confirmApplyRemote()
                })
            ]
        })
    });
});

const diffTable = hoistCmpFactory(() => {
    const model = useModel().detailModel,
        rec = model.record,
        local = rec.localValue,
        remote = rec.remoteValue,
        fields = keys(local || remote);

    const rows = fields.map(field => {
        const cls = model.createDiffClass(field, local, remote),
            localCell = local ? toString(local[field]) : '',
            remoteCell = remote ? {className: cls, item: toString(remote[field])} : '';
        return tr(td(field), td(localCell), td(remoteCell));
    });

    return table({
        className: 'config-diff-table',
        item: tbody(
            tr(
                th('Property'),
                th('Local'),
                th('Remote')
            ),
            ...rows
        )
    });
});
