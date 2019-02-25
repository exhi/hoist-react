/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {div} from '@xh/hoist/cmp/layout';
import {tab as onsenTab, tabbar} from '@xh/hoist/kit/onsen';
import {TabContainerModel} from '@xh/hoist/cmp/tab';

import {tab} from './impl/Tab';

/**
 * Display a set of child Tabs.
 *
 * This TabContainer will install a row of tabs along the bottom of the page.
 * Note that 'TabContainerModel.switcherPosition' is ignored by this component.
 *
 * @see TabContainerModel
 */
@HoistComponent
export class TabContainer extends Component {

    static modelClass = TabContainerModel;

    render() {
        const {model} = this,
            {activeTab} = model,
            tabs = model.tabs.filter(it => !it.excludeFromSwitcher);

        return tabbar({
            index: activeTab ? tabs.indexOf(activeTab) : 0,
            renderTabs: () => tabs.map(tabModel => this.renderTab(tabModel)),
            onPreChange: (e) => model.activateTab(tabs[e.index].id)
        });
    }

    renderTab(tabModel) {
        const {id, title, icon} = tabModel;

        return {
            content: tab({key: id, model: tabModel}),
            tab: onsenTab({
                key: id,
                className: 'xh-tab',
                items: [
                    div({className: 'xh-tab-icon', item: icon, omit: !icon}),
                    div({className: 'xh-tab-label', item: title})
                ]
            })
        };
    }
}
export const tabContainer = elemFactory(TabContainer);