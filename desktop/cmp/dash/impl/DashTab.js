/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import React, {useRef} from 'react';
import {elem, hoistCmp, uses, ModelPublishMode, RenderMode} from '@xh/hoist/core';
import {modelLookupContextProvider, useOwnedModelLinker} from '@xh/hoist/core/impl';
import {refreshContextView} from '@xh/hoist/core/refresh';
import {frame} from '@xh/hoist/cmp/layout';

import {DashTabModel} from './DashTabModel';

/**
 * Wrapper for contents to be shown within a DashContainer. This component is used by DashContainer's
 * internal implementation to:
 *
 *   - Mount/unmount its contents according to `DashViewSpec.renderMode`.
 *   - Track and trigger refreshes according to `DashViewSpec.refreshMode`.
 *   - Stretch its contents using a flex layout.
 *
 * @private
 */
export const dashTab = hoistCmp.factory({
    displayName: 'DashTab',
    className: 'xh-dash-tab',
    model: uses(DashTabModel, {publishMode: ModelPublishMode.LIMITED}),

    render({model, className}) {
        const {
                content,
                contentModel,
                isActive,
                renderMode,
                refreshContextModel,
                modelLookupContext
            } = model,
            wasActivated = useRef(false);

        // Respect RenderMode
        if (!wasActivated.current && isActive) {
            wasActivated.current = true;
        }

        if (
            !isActive &&
            (
                (renderMode == RenderMode.UNMOUNT_ON_HIDE) ||
                (renderMode == RenderMode.LAZY && !wasActivated.current)
            )
        ) {
            return null;
        }

        // Create content, passing in contentModel if provided
        const contentProps = {flex: 1};
        if (contentModel) contentProps.model = contentModel;

        let contentElem = content.isHoistComponent ? elem(content) : content();
        contentElem = React.cloneElement(contentElem, contentProps);

        return modelLookupContextProvider({
            value: modelLookupContext,
            item: frame({
                className,
                item: refreshContextView({
                    model: refreshContextModel,
                    item: ownedModelWrapper({
                        contentModel,
                        contentElem
                    })
                })
            })
        });
    }
});

// This util component allows the content to own the content model, if one
// was provided via a contentModelFn, enabling it to support LoadSupport
const ownedModelWrapper = hoistCmp.factory({
    render({contentModel, contentElem}) {
        useOwnedModelLinker(contentModel ? contentModel : null);
        return contentElem;
    }
});
