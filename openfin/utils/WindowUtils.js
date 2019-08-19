

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