/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import PT from 'prop-types';

import {fragment, div, span, filler} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/mobile/cmp/button';
import {dialog} from '@xh/hoist/mobile/cmp/dialog';
import {Icon} from '@xh/hoist/icon';
import {select} from '@xh/hoist/mobile/cmp/input';
import {withDefault} from '@xh/hoist/utils/js';
import {size, isEmpty} from 'lodash';
import classNames from 'classnames';

import {DimensionChooserModel} from '@xh/hoist/cmp/dimensionchooser';
import './DimensionChooser.scss';

/**
 * Control for selecting a list of dimensions for grouping APIs.
 */
@HoistComponent
export class DimensionChooser extends Component {

    static modelClass = DimensionChooserModel;

    static propTypes = {
        /** Width in pixels of the target button (that triggers show of popover). */
        buttonWidth: PT.number,

        /** Width in pixels of the popover menu itself. */
        dialogWidth: PT.number,

        /** Text to represent empty state (i.e. value = null or [])*/
        emptyText: PT.string,

        /** Primary component model instance. */
        model: PT.instanceOf(DimensionChooserModel).isRequired
    };

    baseClassName = 'xh-dim-chooser';

    INDENT = 10;        // Indentation applied at each level.
    X_BTN_WIDTH = 26;   // Width of 'x' buttons.
    LEFT_PAD = 5;       // Left-padding for inputs.

    get dialogWidth() {
        return withDefault(this.props.dialogWidth, 250);
    }

    get buttonWidth() {
        return withDefault(this.props.buttonWidth, 150);
    }

    get emptyText() {
        return withDefault(this.props.emptyText, '[Ungrouped]');
    }

    render() {
        const {model} = this,
            {value, dimensions} = model;

        const labels = isEmpty(value) ? [this.emptyText] : value.map(h => dimensions[h].label);

        return div(
            this.renderDialog(),
            button({
                className: 'xh-dim-button',
                item: span(labels.join(' \u203a ')),
                width: this.buttonWidth,
                onClick: () => model.showMenu()
            })
        );
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

    //---------------------------
    // Rendering dialog
    //---------------------------
    renderDialog() {
        const {model} = this;
        if (!model) return null;

        return dialog({
            className: this.getClassName('xh-dim-dialog'),
            title: 'Group By',
            icon: Icon.treeList(),
            isOpen: model.isMenuOpen,
            onCancel: () => model.commitPendingValueAndClose(),
            width: this.dialogWidth,
            align: 'left',
            ...this.getDialogPropsForMode(model.activeMode)
        });
    }

    getDialogPropsForMode(mode) {
        return mode === 'history' ?
            {
                content: this.renderHistoryMenu(),
                buttons: this.renderHistoryButtons()
            } :
            {
                content: this.renderSelectMenu(),
                buttons: this.renderSelectButtons()
            };
    }

    //---------------------------
    // Rendering history mode
    //---------------------------
    renderHistoryMenu() {
        const {model} = this,
            {history, dimensions} = model;

        const historyItems = history.map((value, i) => {
            const isActive = value === model.value,
                labels = isEmpty(value) ? [this.emptyText] : value.map(h => dimensions[h].label);

            return button({
                className: classNames('dim-history-btn',
                    isActive ? 'dim-history-btn--active' : null),
                key: `dim-history-${i}`,
                modifier: 'quiet',
                items: [
                    span(` ${labels.map((it, i) => ' '.repeat(i) + '\u203a '.repeat(i ? 1 : 0) + it).join('\n')}`),
                    filler(),
                    div({item: isActive ? Icon.check() : null, style: {width: 25}})
                ],
                onClick: () => {
                    this.onSetFromHistory(value);
                }
            });
        });

        return fragment(...historyItems);
    }

    renderHistoryButtons() {
        const {model} = this;
        return [
            button({
                icon: Icon.x(),
                flex: 1,
                onClick: () => model.closeMenu()
            }),
            button({
                icon: Icon.edit(),
                flex: 1,
                onClick: () => model.showEditor()
            })
        ];
    }

    //---------------------------
    // Rendering select mode
    //---------------------------
    renderSelectMenu() {
        const {LEFT_PAD, INDENT, X_BTN_WIDTH, model} = this,
            {showAddSelect, pendingValue, dimensions, maxDepth, leafInPending, enableClear} = model;

        const children = pendingValue.map((dim, i) => {
            const options = model.dimOptionsForLevel(i, dim),
                marginLeft = LEFT_PAD + (INDENT * i),
                width = this.dialogWidth - marginLeft - X_BTN_WIDTH;

            return div({
                className: 'xh-dim-dialog-select-row',
                items: [
                    select({
                        options,
                        width,
                        marginLeft,
                        value: dim,
                        onChange: val => this.onDimChange(val, i)
                    }),
                    button({
                        icon: Icon.x({className: 'xh-red'}),
                        disabled: !enableClear && pendingValue.length === 1,
                        modifier: 'quiet',
                        onClick: () => {
                            model.removePendingDim(dim);
                            model.setShowAddSelect(false);
                        }
                    })
                ]
            });
        });

        if (isEmpty(pendingValue) && !showAddSelect) {
            children.push(
                div({
                    className: 'xh-dim-dialog-select-row',
                    items: [filler(), this.emptyText, filler()]
                })
            );
        }

        const atMaxDepth = (pendingValue.length === Math.min(maxDepth, size(dimensions)));
        if (!atMaxDepth && !leafInPending) {
            children.push(this.renderAddOrSelectButton());
        }

        return children;
    }

    renderAddOrSelectButton() {
        // can update to match dimension chooser add/select logic
        const {model, LEFT_PAD, INDENT, X_BTN_WIDTH} = this,
            {pendingValue} = model,
            pendingCount = pendingValue.length,
            marginLeft = LEFT_PAD + (pendingCount * INDENT),
            width = this.dialogWidth - marginLeft - X_BTN_WIDTH;

        return model.showAddSelect ?
            select({
                options: model.dimOptionsForLevel(pendingCount),
                width,
                marginLeft,
                onChange: val => this.onDimChange(val, pendingCount)
            }) :
            button({
                text: 'Add grouping...',
                style: {marginLeft, width},
                icon: Icon.add({className: 'xh-green'}),
                modifier: 'quiet',
                onClick: () => model.setShowAddSelect(true)
            });
    }

    renderSelectButtons() {
        const {model} = this;
        return [
            button({
                icon: Icon.arrowLeft(),
                omit: isEmpty(model.history),
                flex: 1,
                onClick: () => model.showHistory()
            }),
            button({
                icon: Icon.check(),
                flex: 1,
                onClick: () => model.commitPendingValueAndClose()
            })
        ];
    }
}

export const dimensionChooser = elemFactory(DimensionChooser);