/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {div} from '@xh/hoist/cmp/layout';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import './UpdateBar.scss';

/**
 * @private
 */
@HoistComponent()
export class UpdateBar extends Component {

    render() {
        const {updateVersion} = this.model,
            cls = 'xh-update-bar';

        if (!updateVersion) return null;

        return toolbar({
            cls,
            items: [
                Icon.rocket({size: 'lg'}),
                div('An application update is available!'),
                button({
                    icon: Icon.refresh(),
                    intent: 'primary',
                    cls: 'bp3-small',
                    text: `Update to ${updateVersion}`,
                    onClick: this.reloadApp
                })
            ]
        });
    }

    reloadApp() {
        XH.reloadApp();
    }
}
export const updateBar = elemFactory(UpdateBar);
