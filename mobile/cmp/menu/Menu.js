/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {div, fragment, hspacer, vbox} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {listItem} from '@xh/hoist/kit/onsen';
import {mask} from '@xh/hoist/mobile/cmp/mask';
import {MenuModel} from '@xh/hoist/mobile/cmp/menu/MenuModel';
import PT from 'prop-types';
import './Menu.scss';

/**
 * Menu Component
 */
export const [Menu, menu] = hoistCmp.withFactory({
    displayName: 'Menu',
    model: uses(MenuModel),
    className: 'xh-menu',

    render({model, className, width, align = 'left'}) {
        const {isOpen, xPos, yPos} = model,
            style = {top: yPos, [align]: xPos, width};

        if (!isOpen) return null;

        const items = model.itemModels.map((it, idx) => {
            if (it.prepareFn) it.prepareFn(it);
            const {text, icon, action, hidden} = it,
                labelItems = icon ? [icon, hspacer(10), text] : [text];

            return listItem({
                key: idx,
                tappable: true,
                item: div({className: 'center', items: labelItems}),
                omit: hidden,
                onClick: () => {
                    if (action) action();
                    model.close();
                }
            });
        });

        return fragment(
            mask({
                isDisplayed: true,
                onClick: () => model.close()
            }),
            div({
                className,
                style,
                item: vbox({
                    className: 'xh-menu__list',
                    items
                })
            })
        );
    }
});

Menu.propTypes = {
    /** Width of the menu. */
    width: PT.number,

    /** How to interpret the provided xPos when showing. */
    align: PT.oneOf(['left', 'right']),

    /** Primary component model instance. */
    model: PT.oneOfType([PT.instanceOf(MenuModel), PT.object]).isRequired
};