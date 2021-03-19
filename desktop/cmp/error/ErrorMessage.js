/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {hoistCmp} from '@xh/hoist/core';
import {frame, div, p} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/desktop/cmp/button';
import {isString, isFunction, isNil} from 'lodash';
import {isValidElement} from 'react';
import PT from 'prop-types';

import './ErrorMessage.scss';

/**
 * Component for displaying an error with standardized styling.
 */
export const [ErrorMessage, errorMessage] = hoistCmp.withFactory({
    className: 'xh-error-message',
    render({className, error, message, title, actionFn, actionButtonProps}, ref) {
        if (isNil(error)) return null;

        if (!message) {
            if (isString(error)) {
                message = error;
            } else if (error.message) {
                message = error.message;
            }
        }

        return frame({
            className,
            item: div({
                ref,
                className: 'xh-error-message__inner',
                items: [
                    titleCmp({title}),
                    messageCmp({message}),
                    actionButton({actionFn, actionButtonProps, error})
                ]
            })
        });
    }
});

ErrorMessage.propTypes = {
    /**
     *  Error to display. If null or undefined this component will not be displayed.
     */
    error: PT.oneOfType([PT.instanceOf(Error), PT.object,  PT.string]),


    /** Optional title to display above the message. */
    title: PT.oneOfType([PT.element, PT.string]),

    /**
     *  Message to display for the error.
     *  Defaults to the error, or any 'message' property contained within it.
     */
    message: PT.oneOfType([PT.element, PT.string]),

    /**
     * If provided, component will render an action button which triggers this function.
     * Receives the value of the 'error' prop as its single argument.
     */
    actionFn: PT.func,

    /** Allows overriding the default properties of the action button. */
    actionButtonProps: PT.object
};

const titleCmp = hoistCmp.factory(
    ({title}) => {
        if (isValidElement(title)) return title;
        if (isString(title)) return div({className: 'xh-error-message__title', item: title});
        return null;
    }
);

const messageCmp = hoistCmp.factory(
    ({message}) => {
        if (isValidElement(message)) return message;
        if (isString(message)) return p(message);
        return null;
    }
);

const actionButton = hoistCmp.factory(
    ({actionFn, actionButtonProps, error}) => {
        if (!isFunction(actionFn)) return null;
        return button({
            text: 'Retry',
            minimal: false,
            onClick: () => actionFn(error),
            ...actionButtonProps
        });
    }
);
