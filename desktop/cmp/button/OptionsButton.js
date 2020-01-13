/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {XH, hoistCmp} from '@xh/hoist/core';
import {button, Button} from './Button';
import {Icon} from '@xh/hoist/icon';

/**
 * Convenience Button preconfigured for use as a trigger for opening the XH options dialog.
 *
 * Can be provided an onClick handler, otherwise will call default framework handler.
 */
export const [OptionsButton, optionsButton] = hoistCmp.withFactory({
    displayName: 'OptionsButton',
    model: false,

    render(props) {
        return button({
            icon: Icon.gear(),
            title: 'Options',
            onClick: () => XH.showOptionsDialog(),
            ...props
        });
    }
});
OptionsButton.propTypes = {...Button.propTypes};
