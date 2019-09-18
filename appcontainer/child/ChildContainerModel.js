/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {RootRefreshContextModel} from '@xh/hoist/core/refresh';
import {RouterModel} from '../../core/RouterModel';

import {AboutDialogModel} from '../AboutDialogModel';
import {ExceptionDialogModel} from '../ExceptionDialogModel';
import {MessageSourceModel} from '../MessageSourceModel';
import {ThemeModel} from '../ThemeModel';
import {ToastSourceModel} from '../ToastSourceModel';

/**
 *  Root object for Framework GUI State.
 */
@HoistModel
export class ChildContainerModel {

    //------------
    // Sub-models
    //------------
    @managed aboutDialogModel = new AboutDialogModel();
    @managed exceptionDialogModel = new ExceptionDialogModel();
    @managed messageSourceModel = new MessageSourceModel();
    @managed toastSourceModel = new ToastSourceModel();
    @managed themeModel = new ThemeModel();
    @managed refreshContextModel = new RootRefreshContextModel();

    @managed routerModel = new RouterModel();

    init() {
        const models = [
            this.aboutDialogModel,
            this.exceptionDialogModel,
            this.messageSourceModel,
            this.toastSourceModel,
            this.themeModel,
            this.refreshContextModel
        ];
        models.forEach(it => {
            if (it.init) it.init();
        });
    }
}