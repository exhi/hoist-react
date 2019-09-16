import {keys, isEmpty, isString} from 'lodash';
import {computed, runInAction} from 'mobx';
import {HoistModel} from '../core';
import {bindable, observable, action} from '../mobx';
import {throwIf} from '../utils/js';
import {connectToChannelAsync, createChannelAsync} from './utils';

@HoistModel
export class SyncModel {
    syncId;

    isProvider;

    @observable.ref properties = {};

    @bindable disabled;

    channelBus;

    get values() {
        return this._valuesProxy;
    }

    constructor({
        syncId,
        isProvider,
        target,
        properties = [],
        disabled
    } = {}) {
        this.syncId = syncId;
        this.isProvider = isProvider;
        this.disabled = disabled;
        this.target = target;

        runInAction(() => properties.forEach(propertySpec => this.addSyncedProperty(propertySpec)));

        this.initAsync()
            .then(() => console.debug('SyncModel Initialized'))
            .catch(err => console.error('Failed to initialize SyncModel', err));
    }

    @action
    addSyncedProperty(propertySpec) {
        const {target} = this;
        propertySpec = {
            valueFn: () => target[propertySpec.name],

            // TODO: Look for a setter function first before falling back to updating the prop directly
            updateFn: (v) => runInAction(() => target[propertySpec.name] = v),

            target,
            ...propertySpec
        };

        const model = propertySpec instanceof PropertySyncModel ? propertySpec : new PropertySyncModel(propertySpec),
            properties = {...this.properties};

        properties[model.name] = model;
        this.properties = properties;
    }

    // --------------------------------
    // Implementation
    // --------------------------------

    async initAsync() {
        const {isProvider} = this;
        if (isProvider) {
            await this.initProviderChannelAsync();
        } else {
            await this.initClientChannelAsync();
        }

        keys(this.properties).forEach(it => this.initSyncedProperty(it));
    }

    initSyncedProperty(name) {
        const {isProvider, channelBus} = this,
            model = this.properties[name];

        throwIf(!channelBus, 'Cannot add a synced property until the channel bus has been initialized!');
        throwIf(!model, `No synced property found with name ${name}`);

        if (isProvider) {
            // TODO: Should this just be a reaction?
            this.addAutorun(() => {
                const payload = {value: model.value};

                console.debug(`SyncModel Provider | Publishing update for: ${name}`);

                channelBus.publish(name, JSON.stringify(payload));
            });
        } else {
            const ret = channelBus.register(name, (payload, providerIdentity) => {
                if (isString(payload) && !isEmpty(payload)) payload = JSON.parse(payload);

                console.debug(`SyncModel Client | Received update for: ${name} | Provider:`, providerIdentity, ' | Payload:', payload);

                const {value} = payload;
                model.setValue(value);
            });

            if (!ret) console.warn(`SyncModel Client | Failed to register handler for property: ${name}`);
        }
    }

    _valuesProxy = this.createValuesProxy();

    createValuesProxy() {
        const me = this;
        return new Proxy({}, {
            get(target, name, receiver) {
                const model = me.properties[name];
                if (model) return model.value;
                return undefined;
            }
        });
    }

    async initProviderChannelAsync() {
        const {syncId} = this,
            channelBus = await createChannelAsync(syncId)
                .catch(err => {
                    console.error(`Failed to create syncId: ${syncId} | Error:`, err);
                });

        if (!channelBus) {
            console.debug('SyncModel Provider | Failed to create the channel bus');
            return;
        }

        channelBus.onConnection((identity) => {
            console.debug(`SyncModel Provider | syncId: ${syncId} | Connection From`, identity);
        });

        channelBus.onDisconnection((identity) => {
            console.debug(`SyncModel Provider | syncId: ${syncId} | Disconnection From`, identity);
        });

        channelBus.onError((action, error, identity) => {
            console.debug(`SyncModel Provider | syncId: ${syncId} | Error in Action ${action} From`, identity, '| Error:', error);
        });

        this.channelBus = channelBus;
    }

    async initClientChannelAsync() {
        const {syncId} = this,
            channelBus = await connectToChannelAsync(syncId)
                .catch(err => {
                    console.error(`Failed to connect to Channel: ${syncId} | Error:`, err);
                });

        if (!channelBus) return;

        console.debug('SyncModel Client | Connected to Channel', syncId);

        channelBus.onError((action, error, identity) => {
            console.debug(`SyncModel Client | Channel: ${syncId} | Error in Action ${action} From`, identity, '| Error:', error);
        });

        channelBus.setDefaultAction((action, payload, identity) => {
            console.debug('SyncModel Client | No handler registered for Action', action, '| Payload:', payload, '| Provider', identity);
        });

        this.channelBus = channelBus;
    }
}

@HoistModel
export class PropertySyncModel {
    name;
    target;
    valueFn;
    updateFn;

    @bindable disabled;

    @computed
    get value() {
        return this.valueFn();
    }

    @action
    setValue(v) {
        this.updateFn(v);
    }

    constructor({
        name,
        valueFn,
        updateFn,
        disabled
    } = {}) {
        this.name = name;
        this.valueFn = valueFn;
        this.updateFn = updateFn;
        this.disabled = disabled;
    }
}