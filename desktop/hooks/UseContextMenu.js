/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {XH} from '@xh/hoist/core';
import {contextMenu as contextMenuEl} from '@xh/hoist/desktop/cmp/contextmenu/ContextMenu';
import {ContextMenu} from '@xh/hoist/kit/blueprint';
import {isArray, isFunction, isUndefined} from 'lodash';
import {cloneElement, isValidElement} from 'react';

/**
 * Hook to add context menu support to a component.
 *
 * @param {element} [child] - element to be given context menu support.  Must specify Component
 *      that takes react context menu event as a prop (e.g. boxes, panel, div, etc).
 * @param {(Array|function|element)} [contextMenu] -  Array of ContextMenuItems, configs to create them,
 *      Elements, or '-' (divider).  Or a function that receives the triggering event and returns such an array.
 *      If null, or the number of items is empty, no menu will be rendered, and the event will be consumed.
 *      A ContextMenu element may also be provided.
 */
export function useContextMenu(child, contextMenu) {

    if (!child || isUndefined(contextMenu)) return child;

    const onContextMenu = (e) => {

        // Skip if already consumed, otherwise consume (Adapted from Blueprint 'ContextMenuTarget')
        if (e.defaultPrevented) return;
        e.preventDefault();

        if (isFunction(contextMenu)) {
            contextMenu = contextMenu(e);
        }
        if (isArray(contextMenu)) {
            contextMenu = contextMenuEl({menuItems: contextMenu});
        }

        if (contextMenu && !isValidElement(contextMenu)) {
            console.error("Incorrect specification of 'contextMenu' arg in useContextMenu()");
            contextMenu = null;
        }

        if (contextMenu) {
            ContextMenu.show(contextMenu, {left: e.clientX, top: e.clientY}, null, XH.darkTheme);
        }
    };

    return cloneElement(child, {onContextMenu});
}