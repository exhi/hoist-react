/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {dialog} from '@xh/hoist/kit/blueprint';
import {hoistCmp} from '@xh/hoist/core';
import {button} from '@xh/hoist/desktop/cmp/button';
import {filler, table, tbody, tr, th, td, fragment} from '@xh/hoist/cmp/layout';
import {jsonInput} from '@xh/hoist/desktop/cmp/input';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {fmtDateTime} from '@xh/hoist/format';

export const activityDetail = hoistCmp.factory(
    ({model}) => {
        const rec = model.detailRecord;

        if (!rec) return null;

        return dialog({
            title: 'Activity Details',
            style: {width: 600},
            isOpen: model.detailRecord,
            onClose: () => model.closeDetail(),
            item: detail()
        });
    }
);


const detail = hoistCmp.factory(
    ({model}) => {
        const rec = model.detailRecord,
            user = rec.impersonating ? `${rec.username} as ${rec.impersonating}` : rec.username;

        return fragment(
            table({
                className: 'xh-admin-activity-detail',
                items: [
                    tbody(
                        tr(th('User:'), td(user)),
                        tr(th('Message:'), td(rec.msg)),
                        tr(th('Category:'), td(rec.category)),
                        tr(th('Device/Browser:'), td(`${rec.device}/${rec.browser}`)),
                        tr(th('Agent:'), td(rec.userAgent)),
                        tr(th('Elapsed (ms):'), td(`${rec.elapsed || ''}`)),
                        tr(th('Date:'), td(fmtDateTime(rec.dateCreated)))
                    )
                ]
            }),
            jsonInput({
                omit: !rec.data,
                value: rec.data,
                disabled: true,
                height: 100,
                width: '100%',
                editorProps: {lineWrapping: true}
            }),
            toolbar(
                filler(),
                button({
                    text: 'Close',
                    intent: 'primary',
                    onClick: () => model.closeDetail()
                })
            )
        );
    }
);