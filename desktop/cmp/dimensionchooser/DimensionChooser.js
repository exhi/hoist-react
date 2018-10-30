/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {vbox, hbox, box} from '@xh/hoist/cmp/layout/index';
import {button} from '@xh/hoist/desktop/cmp/button';
import {buttonGroup, popover, Classes} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';
import {div} from '@xh/hoist/cmp/layout';
import {withDefault} from '@xh/hoist/utils/js';
import {select} from '@xh/hoist/desktop/cmp/form';

import './DimensionChooser.scss';

@HoistComponent
@LayoutSupport
export class DimensionChooser extends Component {

    static defaultProps = {
        minWidth: 200,
        maxWidth: 350
    };

    baseClassName = 'xh-dim-chooser';

    constructor(props) {
        super(props);
    }

    render() {
        return div({
            className: this.baseClassName,
            item: this.prepareDimensionMenu()
        });
    }

    //--------------------
    // Event Handlers
    //--------------------

    onTargetClick = () => {
        this.model.setIsAddNewOpen(false);
        this.model.setIsMenuOpen(true);
    }

    onDimChange = (dim, i) => {
        this.model.addDim(dim, i);
    }

    onAddNewClick = () => {
        this.model.pendingDims = this.model.value;
        this.model.setIsAddNewOpen(true);
    }

    onSaveSelected = () => {
        this.model.commitPendingDims();
    }

    onBackSelected = () => {
        this.model.setIsAddNewOpen(false);
    }

    onSetFromHistory = (idx) => {
        this.model.setDimsFromHistory(idx);
    }

    onCancelSelected = () => {
        this.model.setIsMenuOpen(false);
    }

    onInteraction = (nextOpenState, e) => {
        if (nextOpenState === false) {
            if (this.model.isAddNewOpen) {
                const notSelectClick = withDefault(e, false) &&
                    withDefault(e.target, false) &&
                    withDefault(!e.target.classList.contains('xh-select__option'), false);
                if (notSelectClick) this.onSaveSelected();
            } else {
                this.model.setIsMenuOpen(false);
            }
        }
    };

    //--------------------
    // Rendering top-level menus
    //--------------------

    prepareDimensionMenu() {
        const {maxWidth, minWidth} = this.props,
            {value, toRichDim, isMenuOpen, isAddNewOpen} = this.model;

        const target = button({
            item: toRichDim(value).map(it => it.label).join(' \u203a '),
            style: {maxWidth, minWidth},
            onClick: () => this.onTargetClick()
        });

        const menuContent = isAddNewOpen ? this.prepareAddNewMenu() : this.prepareHistoryMenu();

        return popover({
            target,
            content: vbox({...menuContent, minWidth, maxWidth}),
            isOpen: isMenuOpen,
            onInteraction: (nextOpenState, e) => this.onInteraction(nextOpenState, e),
            targetClassName: 'xh-dim-popover',
            position: 'bottom'
        });
    }

    prepareHistoryMenu() {
        return {
            className: 'xh-dim-history-popover',
            items: [
                this.renderHistoryItems(),
                buttonGroup({
                    items: [
                        button({
                            style: {flex: 1},
                            icon: Icon.x(),
                            onClick: this.onCancelSelected
                        }),
                        button({
                            style: {flex: 2},
                            icon: Icon.add(),
                            title: 'Add a new grouping',
                            onClick: this.onAddNewClick
                        })
                    ]
                })
            ]
        };
    }

    prepareAddNewMenu() {
        return {
            className: 'xh-dim-add-popover',
            items: [
                this.renderSelectChildren(),
                buttonGroup({
                    items: [
                        button({
                            icon: Icon.arrowLeft(),
                            style: {width: '40%'},
                            onClick: () => this.onBackSelected()
                        }),
                        button({
                            icon: Icon.check(),
                            style: {width: '60%'},
                            onClick: () => this.onSaveSelected()
                        })
                    ]
                })
            ]
        };
    }

    //--------------------
    // Render popover items
    //--------------------

    renderSelectChildren() {
        const {pendingDims, availableDims, toRichDim, maxDepth, allDims, leafSelected} = this.model;
        let children = pendingDims.map((dim, i) => {
            return hbox({
                className: 'xh-dim-popover-row',
                style: {marginLeft: 10*i},
                items: [
                    select({
                        enableFilter: false,
                        width: this.props.minWidth - 10*i - 33,
                        options: availableDims(i),
                        value: toRichDim(dim).label,
                        onChange: (newDim) => this.onDimChange(newDim, i)
                    }),
                    button({
                        icon: Icon.x(),
                        minimal: true,
                        disabled: pendingDims.length === 1,
                        onClick: () => this.model.removeDim(dim)
                    })
                ]
            });
        });

        children = pendingDims.length === Math.min(maxDepth, allDims.length)  || leafSelected ?
            children :
            this.appendAddDim(children);

        return vbox({className: 'xh-dim-popover-selects', items: children});
    }

    appendAddDim(children) {
        const {pendingDims, remainingDims} = this.model;
        const indent = (pendingDims.length) * 10;
        children.push(
            box({
                style: {marginLeft: indent},
                items: [
                    select({
                        className: 'xh-dim-popover-add-dim',
                        width: this.props.minWidth - indent - 33,
                        enableFilter: false,
                        options: remainingDims,
                        onChange: (newDim) => this.onDimChange(newDim, pendingDims.length),
                        placeholder: 'Add...'
                    })
                ]
            })
        );
        return children;

    }

    renderHistoryItems() {
        const {history, toRichDim} = this.model;
        return buttonGroup({
            className: 'xh-dim-history-items',
            vertical: true,
            items: [
                history.map((h, i) => {
                    h = toRichDim(h);
                    return button({
                        minimal: true,
                        title: ` ${h.map((it, i) => ' '.repeat(i) + '\u203a '.repeat(i ? 1 : 0) + it.label).join('\n')}`,
                        text: `${h.map(it => it.label).join(' \u203a ')}`,
                        onClick: () => this.onSetFromHistory(i),
                        className: Classes.POPOVER_DISMISS,
                        key: `dim-history-${i}`
                    });
                })
            ]
        });
    }
}

export const dimensionChooser = elemFactory(DimensionChooser);