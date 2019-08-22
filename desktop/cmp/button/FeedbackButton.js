/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistComponent, elemFactory, XH} from '@xh/hoist/core';
import {button, Button} from './Button';
import {Icon} from '@xh/hoist/icon';

/**
 * Convenience Button preconfigured for use as a trigger for the XH feedback dialog.
 * Can be provided an onClick handler, otherwise will call default framework handler.
 */
export const FeedbackButton = hoistComponent({
    displayName: 'FeedbackButton',
    render(props) {
        return button({
            icon: Icon.comment({className: 'fa-flip-horizontal'}),
            title: 'Feedback',
            onClick: () => XH.showFeedbackDialog(),
            ...props
        });
    }
});
FeedbackButton.propTypes = {...Button.propTypes};

export const feedbackButton = elemFactory(FeedbackButton);

