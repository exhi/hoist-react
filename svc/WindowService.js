import {resolve} from '@xh/hoist/promise';
import {HoistService, XH} from '../core';
import {createWindowAsync, isRunningInOpenFin, wrapWindowAsync} from '../openfin/utils';

@HoistService
export class WindowService {
    /** @member {OpenFinWindowService|BrowserWindowService} */
    implSvc;

    async createWindowAsync(createParams) {
        return this.implSvc.createWindowAsync(createParams);
    }

    async findWindowAsync(name) {
        return this.implSvc.findWindowAsync(name);
    }

    async initAsync() {
        this.implSvc = isRunningInOpenFin() ?
            new OpenFinWindowService() :
            new BrowserWindowService();
        return this.implSvc.initAsync();
    }
}

@HoistService
class OpenFinWindowService {
    async createWindowAsync({
        url,
        title,
        name = `${XH.appCode}-window-${new Date().getTime()}`,
        position,
        size = {w: 300, h: 300},
        ...rest
    }) {
        const openFinWindow = await createWindowAsync(name, {
            url,
            defaultWidth: size?.w,
            defaultHeight: size?.h,
            defaultLeft: position?.x,
            defaultTop: position?.y,
            ...rest
        });

        openFinWindow.once('initialized', () => {
            console.debug('OpenFinWindow Initialized', openFinWindow);
            console.debug(openFinWindow.getWebWindow());
        });

        const wnd = openFinWindow.getWebWindow();
        wnd.onload = () => {
            wnd.document.title = title;
        };

        return wnd;
    }

    async findWindowAsync(name) {
        const openFinWindow = await wrapWindowAsync(name);
        if (openFinWindow) {
            return openFinWindow.getWebWindow();
        }

        return null;
    }

    async initAsync() {

    }
}

@HoistService
class BrowserWindowService {
    async createWindowAsync({
        url,
        title,
        name = `${XH.appCode}--window--${new Date().getTime()}`,
        position,
        size = {w: 300, h: 300}
    }) {
        const wnd = window.open(url, name, `width=${size.w},height=${size.h},menubar=no,status=no,titlebar=no,location=no,toolbar=no'`);
        if (position) {
            wnd.moveTo(position.x, position.y);
        }

        wnd.onload = () => {
            wnd.document.title = title;
        };

        return resolve(wnd);
    }

    async findWindowAsync(name) {
    }

    async initAsync() {

    }
}