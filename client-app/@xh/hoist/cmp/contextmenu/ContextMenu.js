/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {start} from 'hoist/promise';
import {menuDivider, menuItem, menu} from 'hoist/kit/blueprint';

@hoistComponent()
export class ContextMenu extends Component {

    render() {
        const items = this.model.items.map(it => {
            return it === '-' ?
                menuDivider() :
                it.$$typeof ? it :
                menuItem({
                    text: it.text,
                    icon: it.icon,
                    onClick: () => start(it.fn)    // do async to allow menu to close
                });
        });
        return menu(items);
    }
}
export const contextMenu = elemFactory(ContextMenu);