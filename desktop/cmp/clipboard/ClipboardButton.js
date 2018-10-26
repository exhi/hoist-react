/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {HoistComponent, XH, elemFactory} from '@xh/hoist/core';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

import ClipboardJS from 'clipboard';

/**
 * Button to copy text to the clipboard - via the clipboard.js library (https://clipboardjs.com).
 */
@HoistComponent
export class ClipboardButton extends Component {

    static propTypes = {
        /** Spec object as expected by the clipboard.js library. */
        clipboardSpec: PT.shape({
            /** Function returning the text to copy. */
            text: PT.func,
            /** Function returning the textarea or input DOM element whose value will be copied. */
            target: PT.func,
            /** Action to take when pointing at a target element containing text - default is copy. */
            action: PT.oneOf(['copy', 'cut'])
        }).isRequired,

        icon: PT.element,
        text: PT.string,
        successMessage: PT.string
    };

    render() {
        const {icon, successMessage, text, clipboardSpec, ...rest} = this.props;
        return button({
            icon: icon || Icon.clipboard(),
            text: text || 'Copy',
            elementRef: this.manageClipboard,
            ...rest
        });
    }


    //---------------------------
    // Implementation
    //---------------------------
    manageClipboard = (elementRef) => {
        if (elementRef) {
            this.createClipboard(elementRef);
        } else {
            this.destroyClipboard();
        }
    }

    createClipboard(btnDom) {
        const clipboardSpec = Object.assign({action: 'copy'}, this.props.clipboardSpec);

        this.clipboard = new ClipboardJS(btnDom, clipboardSpec);
        this.clipboard.on('success', this.onCopySuccess);
        this.clipboard.on('error', this.onCopyError);
    }

    destroyClipboard() {
        if (this.clipboard) this.clipboard.destroy();
    }

    onCopySuccess = (e) => {
        e.clearSelection();

        const {successMessage} = this.props;
        if (successMessage) {
            XH.toast({
                message: successMessage,
                icon: Icon.clipboard()
            });
        }
    }

    onCopyError = (e) => {
        XH.handleException('Failed to copy text to clipboard.', {showAlert: false});
        e.clearSelection();
    }
}
export const clipboardButton = elemFactory(ClipboardButton);