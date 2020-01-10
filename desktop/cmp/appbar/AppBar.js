/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {span} from '@xh/hoist/cmp/layout';
import {hoistCmp, XH} from '@xh/hoist/core';
import {appBarSeparator} from '@xh/hoist/desktop/cmp/appbar';
import {appMenuButton, refreshButton} from '@xh/hoist/desktop/cmp/button';
import {navbar, navbarGroup} from '@xh/hoist/kit/blueprint';
import {isEmpty} from 'lodash';
import PT from 'prop-types';
import './AppBar.scss';

/**
 * A standard application navigation bar which displays the application name and a standard set of
 * buttons for common application actions. Application specific items can be displayed on the left
 * or right sides of the AppBar.
 *
 * The standard buttons which are visible will be based on user roles and application configuration,
 * or they can each be explicitly hidden.
 */
export const [AppBar, appBar] = hoistCmp.withFactory({
    displayName: 'AppBar',
    model: false,
    className: 'xh-appbar',

    render(props) {
        const {
            icon,
            title,
            leftItems,
            rightItems,
            hideRefreshButton,
            hideAppMenuButton,
            className,
            appMenuButtonOptions = {}
        } = props;

        return navbar({
            className,
            items: [
                navbarGroup({
                    align: 'left',
                    items: [
                        icon,
                        span({className: 'xh-appbar-title', item: title || XH.clientAppName}),
                        appBarSeparator({omit: isEmpty(leftItems)}),
                        ...leftItems || []
                    ]
                }),
                navbarGroup({
                    align: 'right',
                    items: [
                        ...rightItems || [],
                        refreshButton({omit: hideRefreshButton}),
                        appMenuButton({omit: hideAppMenuButton, ...appMenuButtonOptions})
                    ]
                })
            ]
        });
    }
});
AppBar.propTypes = {

    /** Icon to display to the left of the title. */
    icon: PT.element,

    /**
     * Title to display to the left side of the AppBar. Defaults to XH.clientAppName.
     */
    title: PT.string,

    /** Items to be added to the left side of the AppBar, immediately after the title (or . */
    leftItems: PT.node,

    /** Items to be added to the right side of the AppBar, before the standard buttons. */
    rightItems: PT.node,

    /** True to hide the Refresh button. */
    hideRefreshButton: PT.bool,

    /** True to hide the AppMenuButton. */
    hideAppMenuButton: PT.bool,

    /** Options to pass to the AppMenuButton. */
    appMenuButtonOptions: PT.object
};
