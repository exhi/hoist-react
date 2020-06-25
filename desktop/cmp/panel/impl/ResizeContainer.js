/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {box, hbox, vbox} from '@xh/hoist/cmp/layout';
import {hoistCmp, useContextModel} from '@xh/hoist/core';
import {Children} from 'react';
import {isString} from 'lodash';
import {PanelModel} from '../PanelModel';
import {dragger} from './dragger/Dragger';
import {splitter} from './Splitter';

export const resizeContainer = hoistCmp.factory({
    displayName: 'ResizeContainer',
    memo: false,
    model: false,
    className: 'xh-resizable',

    render({className, children}, ref) {
        const panelModel = useContextModel(PanelModel),
            {size, resizable, collapsed, vertical, contentFirst, showSplitter} = panelModel,
            dim = vertical ? 'height' : 'width',
            child = Children.only(children),
            dragBarWidth = '8px',
            sizeIsPct = isString(size) && size.endsWith('%');

        const boxSize = sizeIsPct ? `calc(100% - ${dragBarWidth})` : size;
        let items = [collapsed ? box(child) : box({item: child, [dim]: boxSize})];

        if (showSplitter) {
            const splitterCmp = splitter();
            items = (contentFirst ? [...items, splitterCmp] : [splitterCmp, ...items]);
        }

        if (!collapsed && resizable) {
            items.push(dragger());
        }

        const cmp = vertical ? vbox : hbox,
            maxDim = vertical ? 'maxHeight' : 'maxWidth',
            minDim = vertical ? 'minHeight' : 'minWidth',
            cmpSize = !collapsed && sizeIsPct ? size : undefined;

        return cmp({
            ref,
            className,
            flex: 'none',
            [dim]: cmpSize,
            [maxDim]: '100%',
            [minDim]: dragBarWidth,
            items
        });
    }
});