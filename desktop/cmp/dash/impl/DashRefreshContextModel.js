/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {RefreshContextModel} from '@xh/hoist/core/refresh';
import {loadAllAsync, RefreshMode} from '@xh/hoist/core';

/**
 * @private
 */
@RefreshContextModel
export class DashRefreshContextModel {

    viewModel;

    constructor(viewModel)  {
        this.viewModel = viewModel;
        this.addReaction({
            track: () => viewModel.isActive,
            run: this.noteActiveChanged
        });
    }

    async doLoadAsync(loadSpec) {
        const {viewModel} = this,
            mode = viewModel.refreshMode;

        if (viewModel.isActive || mode === RefreshMode.ALWAYS) {
            return await loadAllAsync(this.refreshTargets, loadSpec);
        }

        if (mode === RefreshMode.ON_SHOW_LAZY) {
            this.refreshPending = true;
        }
    }

    noteActiveChanged(isActive) {
        if (isActive) {
            const mode = this.viewModel.refreshMode;
            if (mode === RefreshMode.ON_SHOW_ALWAYS) {
                this.refreshAsync();
            } else if (mode === RefreshMode.ON_SHOW_LAZY && this.refreshPending) {
                this.refreshPending = false;
                this.refreshAsync();
            }
        }
    }
}