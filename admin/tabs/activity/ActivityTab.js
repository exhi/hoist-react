/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent} from '@xh/hoist/core';
import {tabContainer} from '@xh/hoist/cmp/tab';

import {TrackingPanel} from './tracking/TrackingPanel';
import {ClientErrorPanel} from './clienterrors/ClientErrorPanel';
import {FeedbackPanel} from './feedback/FeedbackPanel';

@HoistComponent
export class ActivityTab extends Component {

    render() {
        return tabContainer({
            model: {
                route: 'default.activity',
                switcherPosition: 'left',
                tabs: [
                    {id: 'tracking', content: TrackingPanel},
                    {id: 'clientErrors', content: ClientErrorPanel},
                    {id: 'feedback', content: FeedbackPanel}
                ]
            }
        });
    }
}
