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
import {size, isEmpty} from 'lodash';

import './DimensionChooser.scss';

/**
 * Control which sets a grouping of dimensions on a tree-enabled Grid.
 * Configured by a DimensionChooserModel.
 *
 * @see DimensionChooserModel
 */

@HoistComponent
@LayoutSupport
export class DimensionChooser extends Component {

    static defaultProps = {
        minWidth: 200,
        maxWidth: 350
    };

    baseClassName = 'xh-dim-chooser';

    /** Add menu style. Ensures proper alignment in appendAddDim */
    INDENT = 10;        // Indentation unit applied at each level
    X_BTN_WIDTH = 20;   // Minimum width of 'x' buttons
    ROW_PAD = 3;        // Left padding

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
        this.model.addPendingDim(dim, i);
    }

    onAddNewClick = () => {
        this.model.pendingValue = this.model.value;
        this.model.setIsAddNewOpen(true);
    }

    onSaveSelected = () => {
        this.model.commitPendingValue();
    }

    onBackSelected = () => {
        this.model.setIsAddNewOpen(false);
    }

    onSetFromHistory = (value) => {
        this.model.setValue(value);
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
            {value, dimensions, isMenuOpen, isAddNewOpen} = this.model;

        const target = button({
            item: value.map(it => dimensions[it].label).join(' \u203a '),
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
                            icon: Icon.edit(),
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
                            style: {flex: 1},
                            onClick: () => this.onBackSelected()
                        }),
                        button({
                            icon: Icon.check(),
                            style: {flex: 2},
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
        const {pendingValue, dimensions, dimOptionsForLevel, maxDepth, leafInPending} = this.model,
            {INDENT, X_BTN_WIDTH, ROW_PAD} = this;
        let children = pendingValue.map((dim, i) => {
            const options = dimOptionsForLevel.call(this.model, i);
            return hbox({
                className: 'xh-dim-popover-row',
                style: {marginLeft: 10*i, paddingLeft: ROW_PAD},
                items: [
                    select({
                        options,
                        enableFilter: false,
                        width: this.props.minWidth - (INDENT * i) - (X_BTN_WIDTH + ROW_PAD),
                        value: dimensions[dim].label,
                        onChange: (newDim) => this.onDimChange(newDim, i),
                        disabled: isEmpty(options)
                    }),
                    button({
                        icon: Icon.x(),
                        style: {minWidth: X_BTN_WIDTH},
                        minimal: true,
                        disabled: pendingValue.length === 1,
                        onClick: () => this.model.removePendingDim(dim)
                    })
                ]
            });
        });

        children = pendingValue.length === Math.min(maxDepth, size(dimensions)) || leafInPending ?
            children :
            this.appendAddDim(children);

        return vbox({className: 'xh-dim-popover-selects', items: children});
    }

    appendAddDim(children) {
        const {pendingValue, dimOptionsForLevel} = this.model,
            pendingCount = pendingValue.length,
            marginLeft = pendingCount * this.INDENT + this.ROW_PAD,
            width = this.props.minWidth - marginLeft - this.X_BTN_WIDTH;
        children.push(
            box({
                style: {marginLeft},
                items: [
                    select({
                        options: dimOptionsForLevel.call(this.model, pendingCount),
                        className: 'xh-dim-popover-add-dim',
                        width,
                        enableFilter: false,
                        onChange: (newDim) => this.onDimChange(newDim, pendingCount),
                        placeholder: 'Add...'
                    })
                ]
            })
        );
        return children;

    }

    renderHistoryItems() {
        const {history, dimensions} = this.model;
        return buttonGroup({
            className: 'xh-dim-history-items',
            vertical: true,
            items: [
                history.map((h, i) => {
                    h = h.map(h => dimensions[h].label);
                    return button({
                        minimal: true,
                        title: ` ${h.map((it, i) => ' '.repeat(i) + '\u203a '.repeat(i ? 1 : 0) + it).join('\n')}`,
                        text: h.join(' \u203a '),
                        onClick: () => this.onSetFromHistory(history[i]),
                        className: Classes.POPOVER_DISMISS,
                        key: `dim-history-${i}`
                    });
                })
            ]
        });
    }
}

export const dimensionChooser = elemFactory(DimensionChooser);