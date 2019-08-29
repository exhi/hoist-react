

export async function createChannelAsync(name) {
    return window.fin.InterApplicationBus.Channel.create(name);
}

export async function connectToChannelAsync(name) {
    return window.fin.InterApplicationBus.Channel.connect(name);
}