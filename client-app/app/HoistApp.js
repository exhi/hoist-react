/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import '@blueprintjs/core/dist/blueprint.css';

import 'babel-polyfill';
import {Component} from 'react';
import {elem} from 'hoist';
import {loadMask} from 'hoist/cmp';
import {box, viewport, vbox} from 'hoist/layout';
import {useStrict, observer} from 'hoist/mobx';

import {hoistAppStore} from './HoistAppStore';
import {LoginPanel} from './LoginPanel';
import {ImpersonationBar} from './ImpersonationBar';
import {VersionBar} from './VersionBar';

useStrict(true);

/**
 * Host Component for a Hoist Application
 *
 * Provides initialized Hoist services and basic wrapper components
 * for a hoist application.
 */
export function hoistApp(C) {

    const ret = class extends Component {

        componentDidMount() {
            hoistAppStore.initAsync().catchDefault();
        }

        render() {
            const {authUsername, isInitialized} = hoistAppStore;

            if (!authUsername)  return elem(LoginPanel);
            if (!isInitialized) return loadMask();

            return viewport({
                items: vbox({
                    flex: 1,
                    items: [
                        elem(ImpersonationBar),
                        box({
                            flex: 1,
                            items: elem(C)
                        }),
                        elem(VersionBar)
                    ]
                })
            });
        }
    };

    return observer(ret);
}

