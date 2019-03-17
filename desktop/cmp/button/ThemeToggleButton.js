/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {XH, hoistComponent} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button, Button} from './Button';

/**
 * Convenience Button preconfigured for use as a trigger for light/dark theme toggling.
 */
export const [ThemeToggleButton, themeToggleButton] = hoistComponent({
    render(props) {
        return button({
            icon: XH.darkTheme ? Icon.sun({prefix: 'fas'}) : Icon.moon(),
            title: XH.darkTheme ? 'Switch to light theme' : 'Switch to dark theme',
            onClick: () => XH.toggleTheme(),
            ...props
        });
    }
});
ThemeToggleButton.propTypes = {...Button.propTypes};
