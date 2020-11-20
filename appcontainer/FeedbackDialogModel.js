/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HoistModel, XH} from '@xh/hoist/core';
import {action, observable} from '@xh/hoist/mobx';
import {stripTags} from '@xh/hoist/utils/js';

/**
 * Manages built-in collection of user feedback.
 * @private
 */
export class FeedbackDialogModel extends HoistModel {

    @observable isOpen = false;
    @observable message = null;

    init() {
        this.addReaction({
            track: () => XH.routerState,
            run: () => this.hide()
        });
    }

    @action
    show() {
        this.message = null;
        this.isOpen = true;
    }

    @action
    hide() {
        this.isOpen = false;
        this.message = null;
    }

    @action
    setMessage(message) {
        this.message = stripTags(message);
    }

    /**
     * Submit the feedback entry. Username, browser info, environment info, and datetime will be
     * recorded automatically by the server. Feedback entries are viewable via the Admin console,
     * and feedback submissions can trigger server-side notifications.
     * See FeedbackService.groovy within hoist-core for details.
     */
    async submitAsync() {
        if (!this.message) this.hide();

        return XH.fetchJson({
            url: 'xh/submitFeedback',
            params: {
                msg: this.message,
                appVersion: XH.getEnv('appVersion'),
                clientUsername: XH.getUsername()
            }
        }).then(() => {
            XH.toast({message: 'Your feedback was submitted'});
            this.hide();
        }).linkTo(
            XH.appLoadModel
        ).catchDefault();
    }
}