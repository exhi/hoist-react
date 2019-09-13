import {forEach, toPairs} from 'lodash';
import {runInAction} from '../mobx';
import {applyMixin} from '../utils/js';
import {connectToChannelAsync, createChannelAsync, isRunningInOpenFin} from './utils';

export function SyncSupport(channel) {
    return function(C) {
        return applyMixin(C, {
            name: 'SyncSupport',

            provides: {
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

                    channelBus.onConnection((identity, payload) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Connection From ${identity} | Payload:`, payload);
                    });

                    channelBus.onDisconnection((identity, payload) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Disconnection From ${identity} | Payload:`, payload);
                    });

                    channelBus.onError((action, error, identity) => {
                        console.debug(`SyncSupport Provider | Channel: ${channel} | Error in Action ${action} From ${identity} | Error:`, error);
                    });

                    console.debug('SyncSupport Provider | Synced Properties:', this, this._xhSyncedProperties);

                    // Setup reactions to auto-publish value changes of synced properties
                    forEach(this._xhSyncedProperties, (property, action) => {
                        console.debug(`SyncSupport Provider | Linking action ${action} to property ${property}`);
                        this.addReaction({
                            track: () => this[property],
                            run: (value) => {
                                console.debug(`SyncSupport | Property ${property} Changed - Dispatching Action ${action} - Value: ${value}`);
                                channelBus.dispatch(action, JSON.stringify({action, property, value}));
                            }
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

                    channelBus.onError((action, error, identity) => {
                        console.debug(`SyncSupport Client | Channel: ${channel} | Error in Action ${action} From ${identity} | Error:`, error);
                    });

                    const actionPropPairs = toPairs(this._xhSyncedProperties);
                    await actionPropPairs.map(([action, property]) => {
                        return channelBus.register(action, (payload, identity) => {
                            console.debug(`SyncSupport | Received Action ${action} | Identity: ${identity} | Payload`, payload);

                            const {value} = payload;
                            runInAction(() => this[property] = value);
                        });
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
    addSyncedProperty(target, `${property}Changed`, property);
    return descriptor;
}

sync.with = function(action) {
    return (target, property, descriptor) => {
        addSyncedProperty(target, action, property);
        return descriptor;
    };
};