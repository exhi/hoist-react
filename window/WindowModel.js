import {observable} from '@xh/hoist/mobx';
import {runInAction} from 'mobx';
import {HoistModel, XH} from '../core';
import {bindable} from '../mobx';
import {throwIf} from '../utils/js';

@HoistModel
export class WindowModel {
    @bindable title;
    @observable window;

    get isClosed() {return !this.window}

    constructor({title, window} = {}) {
        this.window = window;
        this.title = title;

        this.addAutorun(() => this.updateWindowProps());
    }

    async open(params) {
        const wnd = await XH.createWindowAsync(params);
        runInAction(() => this.window = wnd);
    }

    navigate(route, params, opts) {
        const {XH} = this.window;
        throwIf(!XH, 'Associated window is not a Hoist application!');

        XH.navigate(route, params, opts);
    }

    // ------------------
    // Implementation
    // ------------------

    async updateWindowProps() {
        const {isClosed, title, window} = this;
        if (isClosed) return;

        window.document.title = title;
    }
}