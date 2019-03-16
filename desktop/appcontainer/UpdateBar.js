/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {XH, useProvidedModel, hoistComponent} from '@xh/hoist/core';
import {div} from '@xh/hoist/cmp/layout';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import './UpdateBar.scss';
import {AppContainerModel} from '@xh/hoist/core/appcontainer/AppContainerModel';

/**
 * @private
 */
export const [UpdateBar, updateBar] = hoistComponent({
    render(props) {
        const model = useProvidedModel(AppContainerModel, props),
            {updateVersion} = model,
            className = 'xh-update-bar';

        if (!updateVersion) return null;

        return toolbar({
            className,
            items: [
                Icon.rocket({size: 'lg'}),
                div(`A new version of ${XH.clientAppName} is available!`),
                button({
                    icon: Icon.refresh(),
                    intent: 'primary',
                    minimal: false,
                    small: true,
                    marginLeft: 10,
                    text: `Update to ${updateVersion}`,
                    onClick: () => XH.reloadApp()
                })
            ]
        });
    }
});