/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {StateProvider} from './StateProvider';

/**
 * StateProvider that stores state within a DashView
 */
export class DashViewProvider extends StateProvider {

    dashViewModel;

    constructor({dashViewModel, key, subKey}) {
        super({key, subKey});
        this.dashViewModel = dashViewModel;
    }

    //----------------
    // Implementation
    //----------------
    readDataImpl() {
        const {viewState} = this.dashViewModel;
        return viewState ? viewState[this.key] ?? null : null;
    }

    writeDataImpl(data) {
        this.dashViewModel.setViewStateKey(this.key, data);
    }

    clearDataImpl() {
        this.dashViewModel.setViewStateKey(this.key, null);
    }
}