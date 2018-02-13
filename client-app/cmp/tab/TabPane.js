/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elem, elemFactory, Ref} from 'hoist';
import {frame} from 'hoist/layout';
import {autorun, observer} from 'hoist/mobx';

/**
 * Container for an Admin Tab
 *
 * This host for a content panel of an admin tab does the following:
 *  - Lazily renders the contents of the tab only when it first becomes active.
 *
 *  - Reload the active tab whenever its lastLoaded is out of date with the
 *     parent containers 'lastRefreshRequest'.
 *
 *  - Stretches the content of the child component using a flex layout.
 *
 * Contained components that load data/state from the server should implement loadAsync(), but
 * generally leave the calling of that method to this component.
 */
@observer
export class TabPane extends Component {

    child = new Ref();
    isLazyState = true

    render() {
        const model = this.model,
            {isActive} = this.model;

        if (isActive) this.isLazyState = false;
        if (this.isLazyState) return null;

        return frame({
            display: isActive ? 'flex' : 'none',
            margin: 4,
            item: elem(model.componentClass, {...this.props, flex: 1, ref: this.child.ref})
        });
    }

    //------------------------------
    // Implementation
    //-----------------------------
    get model() {return this.props.model}

    loadChild() {
        const model = this.model,
            child = this.child.value;

        if (!child.loadAsync) {
            model.markLoaded();
        } else {
            child.loadAsync()
                .finally(() => model.markLoaded())
                .linkTo(model.loadState);
        }
    }

    componentDidMount() {
        this.disposeRunner = autorun(() => {
            const {model, child} = this;
            if (model.needsLoad && child.value) this.loadChild();
        });
    }

    componentWillUnmount() {
        this.disposeRunner();
    }
}
export const tabPane = elemFactory(TabPane);
