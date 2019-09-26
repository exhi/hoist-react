/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {HoistModel, managed} from '@xh/hoist/core';
import {RouteSupport} from '@xh/hoist/core/mixins';
import {RootRefreshContextModel} from '@xh/hoist/core/refresh';
import {action, observable} from '@xh/hoist/mobx';
import {values, isFunction} from 'lodash';
import {XH} from '../../core';
import {AppState} from '../../core/AppState';
import {ExceptionHandler} from '../../core/ExceptionHandler';
import {RouterModel} from '../../core/RouterModel';
import {wait, waitUntil} from '../../promise';
import {PendingTaskModel} from '../../utils/async';
import {ExceptionDialogModel} from '../ExceptionDialogModel';
import {MessageSourceModel} from '../MessageSourceModel';
import {ThemeModel} from '../ThemeModel';
import {ToastSourceModel} from '../ToastSourceModel';
import {ChildState} from './ChildState';

/**
 *  Root object for Framework GUI State.
 */
@HoistModel
export class ChildContainerModel {

    _initCalled = false;

    /** @member {AppSpec} */
    appSpec;

    /** @member {AppContainerModel} */
    appContainerModel;

    childModel;

    /** State of child - see ChildState for valid values. */
    @observable childState = ChildState.INITIALIZING;

    //---------------------------
    // Services
    //---------------------------
    installedServices = {};

    //------------
    // Sub-models
    //------------
    @managed exceptionDialogModel = new ExceptionDialogModel();
    @managed messageSourceModel = new MessageSourceModel();
    @managed toastSourceModel = new ToastSourceModel();
    @managed refreshContextModel = new RootRefreshContextModel();

    /** @member {ThemeModel} */
    themeModel;

    @managed routerModel = new RouterModel();

    window;

    //---------------------------
    // Other State
    //---------------------------
    exceptionHandler = new ExceptionHandler();

    /**
     * Tracks globally loading promises.
     * Link any async operations that should mask the entire application to this model.
     */
    @managed
    appLoadModel = new PendingTaskModel({mode: 'all'});

    constructor(appSpec, appContainerModel, window, isSlave) {
        this.appSpec = appSpec;
        this.appContainerModel = appContainerModel;
        this.window = window;
        this.isSlave = isSlave;

        if (isSlave) {
            this.themeModel = appContainerModel.themeModel;
        } else {
            this.themeModel = new ThemeModel();
            this.markManaged(this.themeModel);
        }

        this.addReaction({
            track: () => this.themeModel.darkTheme,
            run: (value) => {
                const classList = this.window.document.body.classList;
                classList.toggle('xh-dark', value);
                classList.toggle('bp3-dark', value);
            },
            fireImmediately: true
        });
    }

    async initAsync() {
        // Avoid multiple calls, which can occur if AppContainer remounted.
        if (this._initCalled) return;
        this._initCalled = true;

        // TODO: whenAsync!
        await waitUntil(() => this.appContainerModel.appState === AppState.RUNNING);

        // Complete init

        if (!this.isSlave) {
            XH.registerServices(values(this.appContainerModel.installedServices));
            this.themeModel.init();
        }

        this.initModels();

        // Delay to workaround hot-reload styling issues in dev.
        await wait(XH.isDevelopmentMode ? 300 : 1);

        const {model} = this.appSpec;
        if (isFunction(model)) {
            this.childModel = new model();
        } else if (model.isHoistModel) {
            this.childModel = model;
        } else {
            throw XH.exception('Model must be a class/function or instance of a HoistModel!');
        }

        if (!this.isSlave) this.startRouter();

        this.setChildState(ChildState.RUNNING);

        // TODO: How to detect when we enter the SUSPENDED state?
    }

    //--------------------------
    // Exception Support
    //--------------------------
    /**
     * Handle an exception.
     *
     * This method may be called by applications in order to provide logging, reporting,
     * and display of exceptions.  It it typically called directly in catch() blocks.
     *
     * This method is an alias for ExceptionHandler.handleException(). See that method for more
     * information about available options.
     *
     * See also Promise.catchDefault(). That method will delegate its arguments to this method
     * and provides a more convenient interface for Promise-based code.
     */
    handleException(exception, options) {
        return this.exceptionHandler.handleException(exception, options);
    }

    //------------------------
    // Implementation
    //------------------------

    @action
    setChildState(state) {
        if (this.childState !== state) {
            this.childState = state;
        }
    }

    initModels() {
        const models = [
            this.exceptionDialogModel,
            this.messageSourceModel,
            this.toastSourceModel,
            this.refreshContextModel
        ];
        models.forEach(it => {
            if (it.init) it.init();
        });
    }

    startRouter() {
        this.routerModel.addRoutes(RouteSupport.getRoutes());
        this.routerModel.router.start();
    }
}