

export function getApplication() {
    return window.fin.Application.getCurrentSync();
}

export function quitApplication(force) {
    const app = getApplication();
    app.quit(force);
}

export async function getChildWindowsAsync() {
    const app = getApplication();
    return await app.getChildWindows();
}