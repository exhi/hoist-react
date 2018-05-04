/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, hoistComponent} from 'hoist/core';
import {box, hbox} from 'hoist/layout';
import './PanelHeader.scss';


/**
 * A standardized header for a Panel component
 * @private
 */

@hoistComponent()
class PanelHeader extends Component {
    render() {
        const {title, icon, headerItems = []} = this.props;

        if (!title && !icon && !headerItems.length) return null;

        return hbox({
            cls: 'xh-panel-header',
            items: [
                icon ? icon : null,
                title ? box({
                    flex: 1,
                    items: [
                        box({
                            flex: 1,
                            cls: 'xh-header-title',
                            item: title
                        }),
                        ...headerItems
                    ]
                }) : null
            ]
        });
    }
}

export const panelHeader = elemFactory(PanelHeader);