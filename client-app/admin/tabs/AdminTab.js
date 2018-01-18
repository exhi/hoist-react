/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import '@blueprintjs/core/dist/blueprint.css';

import {Component} from 'react';
import {elem, Ref} from 'hoist';
import {hocDisplayName} from 'hoist/utils/ReactUtils';
import {box} from 'hoist/layout';
import {autorun, computed, observer} from 'hoist/mobx';
import {appStore} from '../AppStore';


/**
 * HOC for an Admin Tab
 *
 * This host for a content panel of an admin tab does the following:
 *  - Assigns a label and a unique id to the tab.
 *  - Lazily renders the contents of the tab only when it first becomes active.
 *  - Reload the active tab whenever its lastLoaded is out of date with global app state.
 *  - Stretches the content of the child component using a flex layout.
 *
 * It requires that its child implement:
 *   - loadAsync()
 *   - isLoading (observable)
 *   - lastLoaded (observable)
 */
export function adminTab(tabLabel, tabId) {
    tabId = tabId || tabLabel;
    return function(C) {
        const ret = class extends Component {

            static displayName = hocDisplayName('AdminTab', C);
            static tabLabel = tabLabel;
            static tabId = tabId;

            childCreated = false;
            ref = new Ref();

            constructor() {
                super();
                autorun(() => {
                    if (!this.isActive) return;

                    const child = this.ref.value;
                    if (child && !child.isLoading) {
                        const lastLoaded = child.lastLoaded;
                        if (!lastLoaded || lastLoaded < appStore.lastRefreshRequest) {
                            child.loadAsync();
                        }
                    }
                });
            }

            render() {
                if (!this.childCreated && this.isActive) {
                    this.childCreated = true;
                }
                if (!this.childCreated) return null;

                return box({
                    flex: 1,
                    items: elem(C, {...this.props, ref: this.ref.callback})
                });

            }

            @computed
            get isActive() {
                return appStore.activeTabId === tabId;
            }
        };

        return observer(ret);
    };
}
