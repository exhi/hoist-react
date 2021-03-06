/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {box, vbox, vspacer} from '@xh/hoist/cmp/layout';
import {spinner} from '@xh/hoist/cmp/spinner';
import {hoistCmp} from '@xh/hoist/core';
import {Classes, overlay} from '@xh/hoist/kit/blueprint';
import {withDefault} from '@xh/hoist/utils/js';
import classNames from 'classnames';
import PT from 'prop-types';
import './Mask.scss';

/**
 * Mask with optional spinner and text - can be explicitly shown or bound to a PendingTaskModel.
 *
 * Note that the Panel component's `mask` prop provides a common and convenient method for masking
 * sections of the UI without needing to manually create or manage this component.
 */
export const [Mask, mask] = hoistCmp.withFactory({
    displayName: 'Mask',
    className: 'xh-mask',

    render({model, className, ...props}) {
        const isDisplayed = withDefault(props.isDisplayed, model?.isPending, false);

        if (!isDisplayed) return null;

        const message = withDefault(props.message, model?.message),
            inline = withDefault(props.inline, true),
            showSpinner = withDefault(props.spinner, false);

        return overlay({
            className: classNames(className, Classes.OVERLAY_SCROLL_CONTAINER),
            autoFocus: false,
            isOpen: true,
            canEscapeKeyClose: false,
            usePortal: !inline,
            enforceFocus: !inline,
            item: vbox({
                className: 'xh-mask-body',
                items: [
                    showSpinner ? spinner() : null,
                    showSpinner ? vspacer(10) : null,
                    message ? box({className: 'xh-mask-text', item: message}) : null
                ]
            })
        });
    }
});

Mask.propTypes = {

    /** True to display mask. */
    isDisplayed: PT.bool,

    /** Optional text to be displayed. */
    message: PT.oneOfType([PT.string, PT.element]),

    /** True to display a spinning image.  Default false. */
    spinner: PT.bool,

    /** True (default) to contain mask within its parent, false to fill the viewport. */
    inline: PT.bool,

    /** Click handler **/
    onClick: PT.func
};
