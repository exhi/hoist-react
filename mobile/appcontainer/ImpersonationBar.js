/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {ImpersonationBarModel} from '@xh/hoist/appcontainer/ImpersonationBarModel';
import {div} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {select} from '@xh/hoist/mobile/cmp/input';
import './ImpersonationBar.scss';

/**
 * An admin-only toolbar that provides a UI for impersonating application users, as well as ending
 * any current impersonation setting. Can be shown via a global Shift+i keyboard shortcut.
 *
 * @private
 */
export const impersonationBar = hoistCmp.factory({
    displayName: 'ImpersonationBar',
    model: uses(ImpersonationBarModel),

    render({model}) {
        const {isOpen, targets} = model,
            {identityService} = XH;

        if (!isOpen) return null;

        const username = XH.getUsername(),
            options = [username, ...targets];

        return div({
            className: 'xh-impersonation-bar',
            items: [
                Icon.impersonate({size: 'lg'}),
                select({
                    value: username,
                    options: options,
                    commitOnChange: true,
                    enableCreate: true,
                    createMessageFn: (q) => `Impersonate ${q}`,
                    onCommit: (target) => identityService.impersonateAsync(target)
                }),
                button({
                    icon: Icon.close(),
                    onClick: () => (identityService.isImpersonating ? identityService.endImpersonateAsync() : model.hide())
                })
            ]
        });
    }
});
