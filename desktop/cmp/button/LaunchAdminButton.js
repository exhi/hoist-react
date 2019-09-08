/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {XH, hoistCmpAndFactory} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button, Button} from '@xh/hoist/desktop/cmp/button';

/**
 * Convenience Button to open the admin client.
 * Visible only to users with the hoistAdmin application role.
 */
export const [LaunchAdminButton, launchAdminButton] = hoistCmpAndFactory({
    displayName: 'LaunchAdminButton',
    model: null,

    render(props) {
        if (!XH.getUser().isHoistAdmin) return null;
        return button({
            icon: Icon.wrench(),
            title: 'Launch admin client...',
            onClick: () => window.open('/admin'),
            ...props
        });
    }
});
LaunchAdminButton.propTypes = {...Button.propTypes};

