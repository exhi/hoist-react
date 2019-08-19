/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import PT from 'prop-types';
import {hoistComponent, XH} from '@xh/hoist/core';
import {menu, menuItem, menuDivider, popover} from '@xh/hoist/kit/blueprint';
import {button} from '@xh/hoist/desktop/cmp/button';
import {getClassName} from '@xh/hoist/utils/react';
import {Icon} from '@xh/hoist/icon';
import {isRunningInOpenFin, quitApplication} from '../../../openfin/utils';

export const [AppMenuButton, appMenuButton] = hoistComponent(props => {
    let {hideOptionsItem, hideFeedbackItem, hideThemeItem, hideAdminItem, hideLogoutItem, extraItems} = props;
    extraItems = extraItems ?
        [...extraItems.map(m => menuItem(m)), menuDivider()] :
        [];

    hideAdminItem = hideAdminItem || !XH.getUser().isHoistAdmin;
    hideLogoutItem = hideLogoutItem || XH.appSpec.isSSO;
    hideOptionsItem = hideOptionsItem || !XH.acm.optionsDialogModel.hasOptions;

    const isOpenFinApp = isRunningInOpenFin();

    // TODO:  Need logic from context menu to remove duplicate seperators!
    return popover({
        className: getClassName('xh-app-menu', props),
        position: 'bottom-right',
        minimal: true,
        target: button({
            icon: Icon.bars()
        }),
        content: menu(
            ...extraItems,
            menuItem({
                omit: hideOptionsItem,
                text: 'Options',
                icon: Icon.options(),
                onClick: () => XH.showOptionsDialog()
            }),
            menuItem({
                omit: hideFeedbackItem,
                text: 'Feedback',
                icon: Icon.comment({className: 'fa-flip-horizontal'}),
                onClick: () => XH.showFeedbackDialog()
            }),
            menuItem({
                omit: hideThemeItem,
                text: XH.darkTheme ? 'Light Theme' : 'Dark Theme',
                icon: XH.darkTheme ? Icon.sun({prefix: 'fas'}) : Icon.moon(),
                onClick: () => XH.toggleTheme()
            }),
            menuDivider({omit: hideAdminItem}),
            menuItem({
                omit: hideAdminItem,
                text: 'Admin',
                icon: Icon.wrench(),
                onClick: () => window.open('/admin')
            }),
            menuDivider({omit: hideLogoutItem}),
            menuItem({
                omit: hideLogoutItem,
                text: 'Logout',
                icon: Icon.logout(),
                intent: 'danger',
                onClick: () => XH.identityService.logoutAsync()
            }),
            menuDivider({omit: !isOpenFinApp}),
            menuItem({
                omit: !isOpenFinApp,
                icon: Icon.close(),
                text: 'Quit',
                intent: 'danger',
                onClick: () => quitApplication()
            })
        )
    });
});
AppMenuButton.propTypes = {
    /** True to hide the Launch Admin Item. Always hidden for users w/o HOIST_ADMIN role. */
    hideAdminItem: PT.bool,

    /** True to hide the Feedback Item. */
    hideFeedbackItem: PT.bool,

    /** True to hide the Options button. */
    hideOptionsItem: PT.bool,

    /** True to hide the Theme Toggle button. */
    hideThemeItem: PT.bool,

    /** True to hide the Logout button. Always hidden when `appSpec.isSSO == true`. */
    hideLogoutItem: PT.bool,

    /**
     * Array of configs for additional menu items to be shown.
     */
    extraItems: PT.array
};