import {getApplication} from './ApplicationUtils';

export function getWindow() {
    return window.fin.Window.getCurrentSync();
}

export function getWindowIdentity() {
    return getWindow().me;
}

export function showDevTools() {
    getWindow().showDeveloperTools();
}

export function closeWindow() {
    getWindow().close();
}

export function minimizeWindow() {
    getWindow().minimize();
}

export async function createWindowAsync(name, opts) {
    return window.fin.Window.create({name, ...opts});
}

export async function wrapWindowAsync(name) {
    const {uuid} = getApplication().identity;
    return window.fin.Window.wrap({uuid, name});
}

export async function updateOptionsAsync(opts) {
    return getWindow().updateOptions(opts);
}