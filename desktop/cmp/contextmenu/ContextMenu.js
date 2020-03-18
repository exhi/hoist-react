/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {isValidElement} from 'react';
import PT from 'prop-types';
import {hoistCmp} from '@xh/hoist/core';
import {start} from '@xh/hoist/promise';
import {menuDivider, menuItem, menu} from '@xh/hoist/kit/blueprint';
import {filterMenuSeperators} from '@xh/hoist/utils/cmp';

import {ContextMenuItem} from './ContextMenuItem';

/**
 * ContextMenu
 *
 * Not typically used directly by applications.  To add a Context Menu to an application
 * see ContextMenuHost, or the 'contextMenu` prop on panel.
 *
 * @see StoreContextMenu to specify a context menu on store enabled components.
 * That API will receive specific information about the current selection
 */
export const [ContextMenu, contextMenu] = hoistCmp.withFactory({
    displayName: 'ContextMenu',
    memo: false, model: false, observer: false,

    render({menuItems}) {
        return menu(parseMenuItems(menuItems));
    }
});

ContextMenu.propTypes = {
    /**
     *  Array of ContextMenuItems, configs to create them, Elements, or '-' (divider).
     */
    menuItems: PT.arrayOf(PT.oneOfType([PT.object, PT.string, PT.element])).isRequired
};

//---------------------------
// Implementation
//---------------------------
function parseMenuItems(items) {
    items = items.map(item => {
        if (item === '-' || isValidElement(item)) return item;

        if (!(item instanceof ContextMenuItem)) {
            item = new ContextMenuItem(item);
        }
        if (item.prepareFn) item.prepareFn(item);
        return item;
    });

    items = items.filter(it => {
        return !it.hidden;
    });

    items = filterMenuSeperators(items);

    return items.map(item => {
        if (item === '-') {
            return menuDivider();
        }
        if (isValidElement(item)) {
            return ['Blueprint3.MenuItem', 'Blueprint3.MenuDivider'].includes(item.type.displayName) ?
                item :
                menuItem({text: item});
        }

        const items = item.items ? parseMenuItems(item.items) : null;
        return menuItem({
            text: item.text,
            icon: item.icon,
            onClick: item.actionFn ? () => start(item.actionFn) : null,    // do async to allow menu to close
            disabled: item.disabled,
            items
        });
    });
}