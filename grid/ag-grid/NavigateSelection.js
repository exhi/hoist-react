/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */


/**
 * Allow Key Presses to navigate selection.
 *
 * This is *loosely* based on an example from the AG Docs.
 * It has been modified for efficiency and to allow multi-selection.
 *
 * @private
 */
export function navigateSelection(params, api) {
    const {nextCellDef, previousCellDef, event} = params,
        shiftKey = event.shiftKey,
        prevIndex = previousCellDef ? previousCellDef.rowIndex : null,
        nextIndex = nextCellDef ? nextCellDef.rowIndex : null,
        prevNode = prevIndex ? api.getDisplayedRowAtIndex(prevIndex) : null,
        nextNode = nextIndex ? api.getDisplayedRowAtIndex(nextIndex) : null,
        KEY_UP = 38, KEY_DOWN = 40, KEY_LEFT = 37, KEY_RIGHT = 39;
        
    switch (params.key) {
        case KEY_DOWN:
        case KEY_UP:
            if (nextNode) {
                if (!shiftKey || !prevNode.isSelected()) {
                    // 0) Simple move of selection
                    nextNode.setSelected(true, true);
                } else {
                    // 1) Extend or shrink multi-selection.
                    if (!nextNode.isSelected()) {
                        nextNode.setSelected(true, false);
                    } else {
                        prevNode.setSelected(false, false);
                    }
                }
            }
            return nextCellDef;
        case KEY_LEFT:
        case KEY_RIGHT:
            return nextCellDef;
        default:
    }
}