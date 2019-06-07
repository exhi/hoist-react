/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import PT from 'prop-types';
import {elemFactory, HoistComponent} from '@xh/hoist/core';
import {vbox, hbox} from '@xh/hoist/cmp/layout/index';
import {button, buttonGroup} from '@xh/hoist/desktop/cmp/button';
import {popover} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';
import {div} from '@xh/hoist/cmp/layout';
import {withDefault} from '@xh/hoist/utils/js';
import {select, Select} from '@xh/hoist/desktop/cmp/input';
import {size, isEmpty} from 'lodash';

import {DimensionChooserModel} from '@xh/hoist/cmp/dimensionchooser';
import './DimensionChooser.scss';

/**
 * Control for selecting a list of dimensions for grouping APIs.
 */
@HoistComponent
export class DimensionChooser extends Component {

    static modelClass = DimensionChooserModel;

    static propTypes = {
        /** Icon for target button. */
        buttonIcon: PT.element,

        /** Static text for target button, or null (default) to display current dimensions. */
        buttonText: PT.node,

        /** Width in pixels of the target button. */
        buttonWidth: PT.number,

        /** Primary component model instance. */
        model: PT.instanceOf(DimensionChooserModel).isRequired,

        /** Title for popover (default "GROUP BY") or null to suppress. */
        popoverTitle: PT.string,

        /** Width in pixels of the popover menu itself. */
        popoverWidth: PT.number,

        /** True (default) to style target button as an input field - blends better in toolbars. */
        styleButtonAsInput: PT.bool
    };

    baseClassName = 'xh-dim-chooser';

    INDENT = 10;        // Indentation applied at each level.
    X_BTN_WIDTH = 26;   // Width of 'x' buttons.
    LEFT_PAD = 5;       // Left-padding for inputs.

    get popoverWidth() {
        return withDefault(this.props.popoverWidth, 250);
    }

    get buttonWidth() {
        return withDefault(this.props.buttonWidth, 220);
    }

    get buttonIcon() {
        return this.props.buttonIcon;
    }

    get styleButtonAsInput() {
        return withDefault(this.props.styleButtonAsInput, true);
    }

    render() {
        return div({
            className: this.getClassName(),
            item: this.renderDimensionMenu()
        });
    }

    //--------------------
    // Event Handlers
    //--------------------
    onDimChange = (dim, i) => {
        this.model.addPendingDim(dim, i);
    };

    onSetFromHistory = (value) => {
        this.model.setValue(value);
        this.model.closeMenu();
    };

    // Handle user clicks outside of the popover (which would by default close it).
    onInteraction = (nextOpenState, e) => {
        const {model} = this;
        if (nextOpenState === false) {
            if (model.activeMode == 'edit') {
                // If editing, save then close. Unless dropdown menu option was clicked - then don't do anything.
                const selectOptClick = e && e.target && e.target.closest(`#${Select.MENU_PORTAL_ID}`);
                if (!selectOptClick) this.model.commitPendingValueAndClose();
            } else {
                // ...otherwise just close.
                model.closeMenu();
            }
        }
    };


    //---------------------------
    // Rendering top-level menus
    //---------------------------
    renderDimensionMenu() {
        const {isMenuOpen, activeMode} = this.model,
            styleAsInput = this.styleButtonAsInput,
            className = styleAsInput ? 'xh-dim-button xh-dim-button--as-input' : 'xh-dim-button';

        const target = button({
            item: this.getButtonText(),
            title: this.getButtonTitle(),
            icon: this.buttonIcon,
            width: this.buttonWidth,
            className,
            minimal: styleAsInput,
            onClick: () => this.model.showMenu()
        });

        const menuContent = (activeMode == 'history') ? this.renderHistoryMenu() : this.renderEditMenu();

        return popover({
            target,
            isOpen: isMenuOpen,
            targetClassName: 'xh-dim-popover',
            position: 'bottom',
            content: vbox({
                width: this.popoverWidth,
                ...menuContent
            }),
            onInteraction: (nextOpenState, e) => this.onInteraction(nextOpenState, e)
        });
    }

    getButtonText() {
        const staticText = this.props.buttonText;
        return staticText !== undefined ? staticText : this.getCurrDimensionLabels().join(' › ');
    }

    getButtonTitle() {
        const staticTitle = this.props.buttonTitle;
        if (staticTitle != undefined) return staticTitle;

        const labels = this.getCurrDimensionLabels();
        return labels.map((it, i) => ' '.repeat(i) + (i ? '› ' : '') + it).join('\n');
    }

    getCurrDimensionLabels() {
        const {value, dimensions} = this.model;
        return value.map(it => dimensions[it].label);
    }

    renderHistoryMenu() {
        return {
            className: 'xh-dim-history-popover',
            items: [
                this.renderPopoverTitle(),
                this.renderHistoryItems(),
                buttonGroup({
                    className: 'xh-dim-nav-row',
                    minimal: true,
                    items: [
                        button({
                            icon: Icon.x(),
                            flex: 1,
                            onClick: () => this.model.closeMenu()
                        }),
                        button({
                            icon: Icon.edit(),
                            flex: 2,
                            title: 'Add a new grouping',
                            onClick: () => this.model.showEditor()
                        })
                    ]
                })
            ]
        };
    }

    renderEditMenu() {
        return {
            className: 'xh-dim-add-popover',
            items: [
                this.renderPopoverTitle(),
                this.renderSelectEditors(),
                buttonGroup({
                    className: 'xh-dim-nav-row',
                    items: [
                        button({
                            icon: Icon.arrowLeft(),
                            flex: 1,
                            omit: isEmpty(this.model.history),
                            onClick: () => this.model.showHistory()
                        }),
                        button({
                            icon: Icon.check({className: 'xh-green'}),
                            flex: 2,
                            onClick: () => this.model.commitPendingValueAndClose()
                        })
                    ]
                })
            ]
        };
    }


    //--------------------
    // Render popover items
    //--------------------
    renderSelectEditors() {
        const {LEFT_PAD, INDENT, X_BTN_WIDTH, model} = this,
            {pendingValue, dimensions, maxDepth, leafInPending} = model;

        let children = pendingValue.map((dim, i) => {
            const options = model.dimOptionsForLevel(i, dim),
                marginLeft = LEFT_PAD + (INDENT * i),
                width = this.popoverWidth - marginLeft - X_BTN_WIDTH;

            return hbox({
                className: 'xh-dim-popover-row',
                items: [
                    select({
                        options,
                        value: dim,
                        disabled: isEmpty(options),
                        enableFilter: false,
                        width,
                        marginLeft,
                        onChange: (newDim) => this.onDimChange(newDim, i)
                    }),
                    button({
                        icon: Icon.x({className: 'xh-red'}),
                        maxWidth: X_BTN_WIDTH,
                        minWidth: X_BTN_WIDTH,
                        disabled: pendingValue.length === 1,
                        onClick: () => model.removePendingDim(dim)
                    })
                ]
            });
        });

        const atMaxDepth = (pendingValue.length === Math.min(maxDepth, size(dimensions)));
        if (!atMaxDepth && !leafInPending) {
            children.push(this.renderAddButtonOrSelect());
        }

        return vbox({
            className: 'xh-dim-popover-selects',
            items: children
        });
    }

    renderAddButtonOrSelect() {
        const {model, LEFT_PAD, INDENT, X_BTN_WIDTH} = this,
            {pendingValue} = model,
            pendingCount = pendingValue.length,
            marginLeft = LEFT_PAD + (pendingCount * INDENT),
            width = this.popoverWidth - marginLeft - X_BTN_WIDTH;

        return model.showAddSelect ?
            select({
                options: model.dimOptionsForLevel(pendingCount),
                enableFilter: false,
                autoFocus: true,
                openMenuOnFocus: true,
                width,
                marginLeft,
                onChange: (newDim) => this.onDimChange(newDim, pendingCount)
            }) :
            button({
                text: 'Add grouping...',
                icon: Icon.add({className: 'xh-green'}),
                width,
                marginLeft,
                onClick: () => this.model.setShowAddSelect(true)
            });
    }

    renderHistoryItems() {
        const {history, dimensions} = this.model;
        return buttonGroup({
            className: 'xh-dim-history-items',
            vertical: true,
            items: [
                history.map((value, i) => {
                    const labels = value.map(h => dimensions[h].label);
                    return button({
                        minimal: true,
                        title: ` ${labels.map((it, i) => ' '.repeat(i) + '\u203a '.repeat(i ? 1 : 0) + it).join('\n')}`,
                        text: labels.join(' \u203a '),
                        key: `dim-history-${i}`,
                        onClick: () => this.onSetFromHistory(value)
                    });
                })
            ]
        });
    }

    renderPopoverTitle() {
        const title = withDefault(this.props.popoverTitle, 'Group By');
        if (!title) return null;

        return div({
            className: 'xh-popover-title',
            item: title
        });
    }

}
export const dimensionChooser = elemFactory(DimensionChooser);