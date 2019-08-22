

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

export async function showDevToolsForAllChildWindows() {
    const windows = await getChildWindowsAsync();
    windows.forEach(win => win.showDeveloperTools());
}

export async function bringAllWindowsToFront() {
    const windows = await getChildWindowsAsync();
    windows.forEach(win => win.bringToFront());
}