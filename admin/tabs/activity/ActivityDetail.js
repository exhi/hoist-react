/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {dialog, button} from 'hoist/kit/blueprint';
import {hoistComponent, elemFactory} from 'hoist/core';
import {filler, table, tbody, tr, th, td} from 'hoist/layout';
import {jsonField, toolbar} from 'hoist/cmp';
import {fmtDateTime} from 'hoist/format';
import {Icon} from 'hoist/icon';

@hoistComponent()
class ActivityDetail extends Component {

    render() {
        const model = this.model,
            rec = model.detailRecord;

        if (!rec) return null;

        return dialog({
            title: 'Activity Details',
            style: {width: 600},
            isOpen: model.detailRecord,
            onClose: this.onCloseClick,
            items: this.renderDetail(rec)
        });
    }

    renderDetail(rec) {
        const user = rec.impersonating? `${rec.username} as ${rec.impersonating}`: rec.username;
        return [
            table({
                cls: 'xh-admin-activity-detail',
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
            jsonField({
                omit: !rec.data,
                value: rec.data,
                disabled: true,
                lineWrapping: true,
                height: 100
            }),
            toolbar(
                filler(),
                button({
                    text: 'Close',
                    intent: 'primary',
                    onClick: this.onCloseClick
                })
            )
        ];
    }

    onCloseClick = () => {
        this.model.setDetailRecord(null);
    }
}
export const activityDetail = elemFactory(ActivityDetail);