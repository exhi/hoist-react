/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import PT from 'prop-types';
import {hoistCmp, XH} from '@xh/hoist/core';
import {menu, menuItem, menuDivider, popover} from '@xh/hoist/kit/blueprint';
import {Button, button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

export const [AppMenuButton, appMenuButton] = hoistCmp.withFactory({
    displayName: 'AppMenuButton',
    model: false,
    className: 'xh-app-menu',

    render(props) {
        let {className, hideOptionsItem, hideFeedbackItem, hideThemeItem, hideAdminItem, hideImpersonateItem, hideLogoutItem, extraItems, ...rest} = props;
        extraItems = extraItems ?
            [...extraItems.map(m => menuItem(m)), menuDivider()] :
            [];

        hideAdminItem = hideAdminItem || !XH.getUser().isHoistAdmin;
        hideImpersonateItem = hideImpersonateItem || !XH.identityService.canImpersonate;
        hideLogoutItem = hideLogoutItem || XH.appSpec.isSSO;
        hideOptionsItem = hideOptionsItem || !XH.acm.optionsDialogModel.hasOptions;

        // TODO:  Need logic from context menu to remove duplicate separators!
        return popover({
            className,
            position: 'bottom-right',
            minimal: true,
            target: button({
                icon: Icon.bars(),
                ...rest
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
                menuDivider({omit: hideAdminItem && hideImpersonateItem}),
                menuItem({
                    omit: hideAdminItem,
                    text: 'Admin',
                    icon: Icon.wrench(),
                    onClick: () => window.open('/admin')
                }),
                menuItem({
                    omit: hideImpersonateItem,
                    text: 'Impersonate',
                    icon: Icon.impersonate(),
                    onClick: () => XH.showImpersonationBar()
                }),
                menuDivider({omit: hideLogoutItem}),
                menuItem({
                    omit: hideLogoutItem,
                    text: 'Logout',
                    icon: Icon.logout(),
                    intent: 'danger',
                    onClick: () => XH.identityService.logoutAsync()
                })
            )
        });
    }
});
AppMenuButton.propTypes = {
    ...Button.propTypes,

    /** Array of configs for any app-specific menu items. */
    extraItems: PT.array,

    /** True to hide the Admin Item. Always hidden for users w/o HOIST_ADMIN role. */
    hideAdminItem: PT.bool,

    /**
     * True to hide the Impersonate Item.
     * Always hidden for users w/o HOIST_ADMIN role or if impersonation is disabled.
     */
    hideImpersonateItem: PT.bool,

    /** True to hide the Feedback Item. */
    hideFeedbackItem: PT.bool,

    /** True to hide the Logout button. Always hidden when `appSpec.isSSO == true`. */
    hideLogoutItem: PT.bool,

    /** True to hide the Options button. */
    hideOptionsItem: PT.bool,

    /** True to hide the Theme Toggle button. */
    hideThemeItem: PT.bool
};
