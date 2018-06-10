/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, HoistComponent} from '../../core';
import {tab, tabs} from '@xh/hoist/kit/blueprint';
import {TabContainerModel} from './TabContainerModel';

/**
 * Switcher display for a TabContainer.
 */
@HoistComponent()
export class TabSwitcher extends Component {
    static propTypes = {
        /** Model to switch tabs on. Should be shared with a TabContainer. */
        model: PT.instanceOf(TabContainerModel)
    };

    render() {
        const {vertical, id, children} = this.model;
        return tabs({
            id,
            vertical,
            onChange: this.onTabChange,
            large: !vertical,
            items: children.map(({id, name}) => tab({id, title: name}))
        });
    }

    onTabChange = (activeId) => {
        this.model.setSelectedId(activeId);
    };
}

export const tabSwitcher = elemFactory(TabSwitcher);