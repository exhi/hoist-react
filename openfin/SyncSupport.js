import {forEach, isEmpty, isString} from 'lodash';
import {runInAction} from '../mobx';
import {applyMixin, throwIf} from '../utils/js';
import {connectToChannelAsync, createChannelAsync, isRunningInOpenFin} from './utils';

export function SyncSupport(channel, isProvider) {
    return function(C) {
        return applyMixin(C, {
            name: 'SyncSupport',

            init: function() {
                if (isProvider) {
                    this.initAsProviderAsync()
                        .then(() => this.onSyncReady());
                } else {
                    this.initAsSubscriberAsync()
                        .then(() => this.onSyncReady());
                }
            },

            defaults: {
                onSyncReady() {}
            },

            provides: {
                addSyncAction({action, track, valueFn}) {
                    throwIf(!this._xhChannelProviderBus, 'Only Providers can add sync actions!');
                    this.addReaction({
                        track,
                        run: (value) => {
                            value = valueFn ? valueFn(value) : value;
                            console.debug(`SyncSupport | Publishing Action ${action} - Value: ${value}`);
                            this._xhChannelProviderBus.publish(action, JSON.stringify({action, value}));
                        }
                    });
                },

                async initAsProviderAsync() {
                    if (!isRunningInOpenFin()) return;

                    const channelBus = await createChannelAsync(channel)
                        .catch(err => {
                            console.error(`Failed to create Channel: ${channel} | Error:`, err);
                        });

                    if (!channelBus) {
                        console.debug('SyncSupport | Failed to create the channel bus');
                        return;
                    }

                    channelBus.onConnection((identity) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Connection From`, identity);
                    });

                    channelBus.onDisconnection((identity) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Disconnection From`, identity);
                    });

                    channelBus.onError((action, error, identity) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Error in Action ${action} From`, identity, '| Error:', error);
                    });

                    console.debug('SyncSupport Provider | Synced Properties:', this, this._xhSyncedProperties);

                    // Setup reactions to auto-publish value changes of synced properties
                    forEach(this._xhSyncedProperties, (property, action) => {
                        console.debug(`SyncSupport Provider | Linking action ${action} to property ${property}`);
                        this.addAutorun(() => {
                            const value = this[property];
                            console.debug(`SyncSupport | Property ${property} Changed - Publishing Action ${action} - Value: ${value}`);
                            channelBus.publish(action, JSON.stringify({action, property, value}));
                        });
                    });

                    this._xhChannelProviderBus = channelBus;
                },

                async initAsSubscriberAsync() {
                    if (!isRunningInOpenFin()) return;

                    const channelBus = await connectToChannelAsync(channel)
                        .catch(err => {
                            console.error(`Failed to connect to Channel: ${channel} | Error:`, err);
                        });

                    if (!channelBus) return;

                    console.debug('SyncSupport | Connected to Channel', channel);

                    channelBus.onError((action, error, identity) => {
                        console.debug(`SyncSupport Client | Channel: ${channel} | Error in Action ${action} From ${identity} | Error:`, error);
                    });

                    channelBus.setDefaultAction((action, payload, identity) => {
                        console.debug('SyncSupport | No handler registered for Action', action, '| Payload:', payload, '| Provider', identity);
                    });

                    forEach(this._xhSyncedProperties, (property, action) => {
                        console.debug('SyncSupport | Registering Action', action, 'for Property', property);
                        const ret = channelBus.register(action, (payload, identity) => {
                            if (isString(payload) && !isEmpty(payload)) payload = JSON.parse(payload);

                            console.debug(`SyncSupport | Received Action: ${action} | Provider:`, identity, ' | Payload:', payload);

                            const {value} = payload;
                            runInAction(() => this[property] = value);
                        });

                        if (!ret) console.warn(`SyncSupport | Failed to register Action ${action} for property ${property}`);
                    });

                    this._xhChannelClientBus = channel;
                }
            },

            chains: {
                destroy() {
                    if (this._xhChannelProviderBus) this._xhChannelProviderBus.destroy();
                    if (this._xhChannelClientBus) this._xhChannelClientBus.disconnect();
                }
            }
        });
    };
}

function addSyncedProperty(target, action, property) {
    console.debug(`sync | Action: ${action} | Target:`, target, `| Property: ${property}`);
    target._xhSyncedProperties = target._xhSyncedProperties || {};
    target._xhSyncedProperties[action] = property;
}

export function sync(target, property, descriptor) {
    addSyncedProperty(target, property, property);
    return descriptor;
}

sync.with = function(action) {
    return (target, property, descriptor) => {
        addSyncedProperty(target, action, property);
        return descriptor;
    };
};