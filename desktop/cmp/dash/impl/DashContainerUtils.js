/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {throwIf} from '@xh/hoist/utils/js';
import {isEmpty, isFinite, isArray, isPlainObject, isNil, isString} from 'lodash';

/**
 * Lookup the DashTabModel id of a rendered view
 */
export function getViewModelId(view) {
    if (!view || !view.isInitialised || !view.isComponent) return;
    return view.instance?._reactComponent?.props?.id;
}

/**
 * Convert the output from Golden Layouts into our serializable state
 */
export function convertGLToState(goldenLayout, viewState) {
    const configItems = goldenLayout.toConfig().content,
        contentItems = goldenLayout.root.contentItems;

    return convertGLToStateInner(configItems, contentItems, viewState);
}

function convertGLToStateInner(configItems = [], contentItems = [], viewState) {
    const ret = [];

    configItems.forEach((configItem, idx) => {
        const contentItem = contentItems[idx];

        if (configItem.type === 'component') {
            const state = viewState[getViewModelId(contentItem)],
                view = {type: 'view', id: configItem.component};

            if (!isEmpty(state)) view.state = state;

            ret.push(view);
        } else {
            const {type, width, height, activeItemIndex, content} = configItem,
                container = {type};

            if (isFinite(width)) container.width = width;
            if (isFinite(height)) container.height = height;
            if (isFinite(activeItemIndex)) container.activeItemIndex = activeItemIndex;
            if (isArray(content) && content.length) {
                container.content = convertGLToStateInner(content, contentItem.contentItems, viewState);
            }

            ret.push(container);
        }
    });

    return ret;
}

/**
 * Convert our serializable state into GoldenLayout config
 */
export function convertStateToGL(state = [], dashContainerModel) {
    const {viewSpecs, containerRef} = dashContainerModel,
        containerSize = {
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
        };

    return convertStateToGLInner(state, viewSpecs, containerSize);
}

function convertStateToGLInner(items = [], viewSpecs = [], containerSize, containerItem) {
    // If placed in a row or column, size its content according to its container
    const dimension = getContainerDimension(containerItem?.type);
    if (dimension) items = sizeItemsToContainer(items, containerSize, dimension);

    // Convert each item into a GoldenLayout config
    return items.map(item => {
        const {type, width, height} = item;

        throwIf(type === 'component' || type === 'react-component',
            'Trying to use "component" or "react-component" types. Use type="view" instead.'
        );

        if (type === 'view') {
            const viewSpec = viewSpecs.find(v => v.id === item.id);

            if (!viewSpec) {
                console.warn(`Attempting to load unrecognised view "${item.id}" from state`);
                return {type: 'row'};
            }

            const ret = viewSpec.goldenLayoutConfig;

            if (isPlainObject(item.state)) ret.state = item.state;
            if (isFinite(width)) ret.width = width;
            if (isFinite(height)) ret.height = height;

            return ret;
        } else {
            const itemSize = {...containerSize};

            if (dimension) {
                itemSize[dimension] = relativeSizeToPixels(item[dimension], containerSize[dimension]);
            }

            const content = convertStateToGLInner(item.content, viewSpecs, itemSize, item);
            return {...item, content};
        }
    });
}

function sizeItemsToContainer(items, containerSize, dimension) {
    const unsizedItems = [];
    let totalSize = 0;
    items.forEach(item => {
        // If this item is unsized, keep track of it for later
        if (isNil(item[dimension])) {
            unsizedItems.push(item);
            return;
        }

        //  GoldenLayout deals exclusively with relative sizes. If the size
        //  is defined in pixels, we must convert it to a relative size.
        //  We can use the containerSize to do so.
        if (isString(item[dimension]) && item[dimension].endsWith('px')) {
            const intSize = parseInt(item[dimension]);
            item[dimension] = pixelsToRelativeSize(intSize, containerSize[dimension]);
        }

        totalSize += item[dimension];
    });

    // Insert an explicit size on any unsized items, by equally dividing the remaining size
    const remainingSize = 100 - totalSize;
    unsizedItems.forEach(item => {
        item[dimension] = (remainingSize / unsizedItems.length);
    });

    return items;
}

function getContainerDimension(type) {
    if (type === 'row') return 'width';
    if (type === 'column') return 'height';
    return null;
}

function pixelsToRelativeSize(pixelSize, containerSize) {
    const borderSize = 3;
    return ((pixelSize + borderSize) / containerSize) * 100;
}

function relativeSizeToPixels(relSize, containerSize) {
    return (containerSize / 100) * relSize;
}