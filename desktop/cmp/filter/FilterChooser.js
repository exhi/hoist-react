/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {FilterChooserModel} from '@xh/hoist/cmp/filter';
import {box, div, hbox, hframe} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Select, select} from '@xh/hoist/desktop/cmp/input';
import {Icon} from '@xh/hoist/icon';
import {menu, menuDivider, menuItem, popover} from '@xh/hoist/kit/blueprint';
import {splitLayoutProps} from '@xh/hoist/utils/react';
import classNames from 'classnames';
import {isEmpty, sortBy} from 'lodash';

import './FilterChooser.scss';

/**
 * A Select based control for searching and choosing filters.
 * @see FilterChooserModel
 */
export const [FilterChooser, filterChooser] = hoistCmp.withFactory({
    model: uses(FilterChooserModel),
    className: 'xh-filter-chooser',
    render({model, className, ...props}) {
        const [layoutProps, rest] = splitLayoutProps(props),
            {inputRef, selectOptions, favoritesIsOpen} = model;

        return box({
            className,
            ...layoutProps,
            item: popover({
                item: select({
                    flex: 1,
                    bind: 'selectValue',
                    ref: inputRef,
                    placeholder: 'Filter...',
                    enableMulti: true,
                    enableClear: true,
                    queryFn: (q) => model.queryAsync(q),
                    options: selectOptions,
                    optionRenderer,
                    rsOptions: {
                        defaultOptions: [],
                        openMenuOnClick: false,
                        openMenuOnFocus: false,
                        isOptionDisabled: (opt) => opt.type === 'msg',
                        noOptionsMessage: () => null,
                        loadingMessage: () => null,
                        styles: {
                            menuList: (base) => ({...base, maxHeight: 'unset'})
                        },
                        components: {
                            DropdownIndicator: () => favoritesIcon(model)
                        }
                    },
                    ...rest
                }),
                content: favoritesMenu(),
                isOpen: favoritesIsOpen,
                position: 'bottom-right',
                minimal: true,
                onInteraction: (willOpen) => {
                    if (!willOpen) model.closeFavoritesMenu();
                }
            })
        });
    }
});

FilterChooser.propTypes = {
    ...Select.propTypes
};


//-----------------
// Options
//------------------
function optionRenderer(opt) {
    switch (opt.type) {
        case 'field' : return fieldOption(opt);
        case 'filter': return filterOption(opt);
        case 'msg': return messageOption(opt);
    }
    return null;
}

const fieldOption = hoistCmp.factory({
    model: false, observer: false, memo: false,
    render({fieldSpec}) {
        const {displayName, ops, example} = fieldSpec;
        return hframe({
            className: 'xh-filter-chooser-option__field',
            items: [
                div('e.g.'),
                div({className: 'name', item: displayName}),
                div({className: 'operators', item: '[ ' + ops.join(', ') + ' ]'}),
                div({className: 'example', item: example})
            ]
        });
    }
});

const filterOption = hoistCmp.factory({
    model: false, observer: false,
    render({filter, fieldSpec, displayValue}) {
        return hframe({
            className: 'xh-filter-chooser-option',
            items: [
                div({className: 'name', item: fieldSpec.displayName}),
                div({className: 'operator', item: filter.op}),
                div({className: 'value', item: displayValue})
            ]
        });
    }
});

const messageOption = hoistCmp.factory({
    model: false, observer: false,
    render({label}) {
        return hframe({
            className: 'xh-filter-chooser-option__message',
            item: label
        });
    }
});

//-----------------
// Favorites
//------------------
function favoritesIcon(model) {
    if (!model.persistFavorites) return null;
    const isFavorite = model.isFavorite(model.value);
    return Icon.favorite({
        prefix: isFavorite ? 'fas' : 'far',
        className: classNames(
            'xh-select__indicator',
            'xh-filter-chooser-favorite-icon',
            isFavorite ? 'xh-filter-chooser-favorite-icon--active' : null
        ),
        onClick: (e) => {
            model.openFavoritesMenu();
            e.stopPropagation();
        }
    });
}

const favoritesMenu = hoistCmp.factory({
    render({model}) {
        const options = getFavoritesOptions(model),
            isFavorite = model.isFavorite(model.value),
            addDisabled = isEmpty(model.value) || isFavorite,
            items = [];

        if (isEmpty(options)) {
            items.push(menuItem({text: 'You have not yet saved any favorites...', disabled: true}));
        } else {
            items.push(...options.map(it => favoriteMenuItem(it)));
        }

        items.push(
            menuDivider(),
            menuItem({
                icon: Icon.add({className: addDisabled ? '' : 'xh-intent-success'}),
                text: 'Add current filter to favorites',
                disabled: addDisabled,
                onClick: () => model.addFavorite(model.value)
            })
        );

        return menu({items});
    }
});

const favoriteMenuItem = hoistCmp.factory({
    render({model, value, labels}) {
        return menuItem({
            text: hbox(labels.map(label => favoriteTag({label}))),
            className: 'xh-filter-chooser-favorite',
            onClick: () => model.setValue(value),
            labelElement: button({
                icon: Icon.cross(),
                intent: 'danger',
                onClick: (e) => {
                    model.removeFavorite(value);
                    e.stopPropagation();
                }
            })
        });
    }
});

const favoriteTag = hoistCmp.factory({
    render({label}) {
        return div({
            className: 'xh-filter-chooser-favorite__tag',
            item: label
        });
    }
});

function getFavoritesOptions(model) {
    const ret = model.favoritesOptions.map(f => {
        const labels = f.filterOptions.map(option => option.label);
        return {value: f.value, labels};
    });

    return sortBy(ret, it => it.labels[0]);
}