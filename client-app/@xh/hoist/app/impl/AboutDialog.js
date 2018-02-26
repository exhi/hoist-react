/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {hoistComponent, hoistModel, elemFactory} from 'hoist/core';
import {alert} from 'hoist/kit/blueprint';

@hoistComponent()
export class AboutDialog extends Component {
    render() {
        return alert({
            isOpen: this.props.isOpen,
            icon: 'info-sign',
            cls: this.darkTheme ? 'xh-dark' : '',
            item: 'About This Application....',
            confirmButtonText: 'OK',
            onConfirm: this.onConfirm
        });
    }

    onConfirm = () => {
        hoistModel.setShowAbout(false);
    }
}
export const aboutDialog = elemFactory(AboutDialog);