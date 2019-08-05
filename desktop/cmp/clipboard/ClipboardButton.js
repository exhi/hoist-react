/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {HoistComponent, XH, elemFactory} from '@xh/hoist/core';
import {button, Button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';
import {withDefault} from '@xh/hoist/utils/js';

import copy from 'clipboard-copy';

/**
 * Button to copy text to the clipboard.
 */
@HoistComponent
export class ClipboardButton extends Component {

    static propTypes = {
        ...Button.propTypes,

        /** Function returning the text to copy. */
        getCopyText: PT.func.isRequired,

        /** Message to be displayed in a toast when copy is complete. */
        successMessage: PT.string
    };

    render() {
        const {icon, onClick, text, getCopyText, successMessage, ...rest} = this.props;
        return button({
            icon: withDefault(icon, Icon.clipboard()),
            text: withDefault(text, 'Copy'),
            onClick: withDefault(onClick, this.onClick),
            ...rest
        });
    }


    //---------------------------
    // Implementation
    //---------------------------
    onClick = async (e) => {
        const {successMessage, getCopyText} = this.props;

        try {
            await copy(getCopyText());
            if (successMessage) {
                XH.toast({
                    message: successMessage,
                    icon: Icon.clipboard()
                });
            }
        } catch (e) {
            XH.handleException(e, {showAlert: false});
        }
    };
}
export const clipboardButton = elemFactory(ClipboardButton);