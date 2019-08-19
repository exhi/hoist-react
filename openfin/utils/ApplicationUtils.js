

export function getApplication() {
    return window.fin.Application.getCurrentSync();
}

export function quitApplication(force) {
    const app = getApplication();
    app.quit(force);
}