/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {XH, hoistModel} from 'hoist/core';
import {observable, setter} from 'hoist/mobx';

export class FeedbackDialogModel {

    @setter @observable isOpen = false;
    @setter @observable feedback = null;
    
    submitFeedback() {
        XH.feedbackService.submitAsync({msg: this.feedback})
            .then(() => {this.hide()})
            .linkTo(hoistModel.appLoadModel)
            .catchDefault();
    }

    show() {
        this.setIsOpen(true);
    }

    hide() {
        this.setIsOpen(false);
        this.setFeedback(null);
    }

}