import {observable} from '@xh/hoist/mobx';
import {HoistModel, XH} from '../core';
import {bindable, computed, runInAction} from '../mobx';
import {throwIf} from '../utils/js';
import {isEmpty} from 'lodash';

@HoistModel
export class ChildWindowModel {
    name;
    @bindable title;
    @observable window;

    @computed
    get isOpen() {return !!this.window}

    constructor({title, window, name} = {}) {
        this.window = window;
        this.title = title;
        this.name = name;

        if (!isEmpty(name)) {
            this.attach(name);
        }

        this.addAutorun(() => this.updateWindowProps());

        this.addReaction({
            track: () => this.window,
            run: (wnd) => {
                if (wnd) {
                    wnd.addEventListener('beforeunload', () => {
                        console.debug('Got beforeunload event on child window!');
                        runInAction(() => this.window = null);
                    });
                }
            },
            fireImmediately: true
        });
    }

    async open(params) {
        const wnd = await XH.createWindowAsync({name: this.name, ...params});
        console.debug('Opened window', wnd);
        runInAction(() => this.window = wnd);
    }

    async attach(name) {
        const wnd = await XH.findWindowAsync(name);
        if (wnd) {
            runInAction(() => this.window = wnd);
            return true;
        }

        return false;
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
        const {isOpen, title, window} = this;
        if (!isOpen) return;

        window.document.title = title;
    }
}