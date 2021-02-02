/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {HoistModel, hoistCmp, useLocalModel} from '@xh/hoist/core';
import {bindable, makeObservable} from '@xh/hoist/mobx';
import {popover} from '@xh/hoist/mobile/cmp/popover';
import {Icon} from '@xh/hoist/icon';
import {button, Button} from '@xh/hoist/mobile/cmp/button';
import PT from 'prop-types';

import {MenuItem} from './MenuItem';
import {menu} from './impl/Menu';

/**
 * Convenience Button preconfigured for use as a trigger for a dropdown menu operation.
 */
export const [MenuButton, menuButton] = hoistCmp.withFactory({
    displayName: 'MenuButton',
    className: 'xh-menu-button',

    render({
        menuItems,
        menuPosition = 'auto',
        popoverProps,
        icon = Icon.bars(),
        ...props
    }) {
        const impl = useLocalModel(LocalModel);

        return popover({
            isOpen: impl.isOpen,
            position: menuPosition,
            target: button({icon, ...props}),
            content: menu({menuItems, onDismiss: () => impl.setIsOpen(false)}),
            onInteraction: (nextOpenState) => impl.setIsOpen(nextOpenState),
            backdrop: true,
            ...popoverProps
        });
    }
});

MenuButton.propTypes = {
    ...Button.propTypes,

    /** Array of MenuItems or configs to create them */
    menuItems: PT.arrayOf(PT.oneOfType([PT.instanceOf(MenuItem), PT.object])).isRequired,

    /** Position of menu relative to button */
    menuPosition: PT.oneOf([
        'top-left', 'top', 'top-right',
        'right-top', 'right', 'right-bottom',
        'bottom-right', 'bottom', 'bottom-left',
        'left-bottom', 'left', 'left-top',
        'auto'
    ]),

    /** Props passed to the internal popover */
    popoverProps: PT.object
};

class LocalModel extends HoistModel {
    @bindable isOpen = false;

    constructor() {
        super();
        makeObservable(this);
    }
}
