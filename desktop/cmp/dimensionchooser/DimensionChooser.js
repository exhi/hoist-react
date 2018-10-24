/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import {PropTypes as PT} from 'prop-types';
import {vbox, hbox, box} from '@xh/hoist/cmp/layout/index';
import {button} from '@xh/hoist/desktop/cmp/button';
import {buttonGroup, popover, Classes} from '@xh/hoist/kit/blueprint';
import {Icon} from '@xh/hoist/icon';
import {div, hspacer} from '@xh/hoist/cmp/layout';
import {isEmpty, isPlainObject} from 'lodash';
import {select} from '@xh/hoist/desktop/cmp/form';
import {observable, action} from '@xh/hoist/mobx';

import {DimensionChooserModel} from './DimensionChooserModel';
import './DimensionChooser.scss';
import {throwIf, withDefault} from '@xh/hoist/utils/js';

@HoistComponent
@LayoutSupport
export class DimensionChooser extends Component {

    static propTypes = {
        /** Array of grid dimensions, in ordered from least to most specific */
        dimensions: PT.array,
        /** Maximum number of dimension groupings to save in state */
        maxHistoryLength: PT.number,
        /** Maximum number of dimensions that can be set on the grid */
        maxDepth: PT.number
    };

    static defaultProps = {
        historyLength: 5,
        indentLevels: true,
        indentWidthPct: 5,
        placeholder: 'Select groupings...',
        width: 200
    };

    baseClassName = 'xh-dim-chooser';

    @observable isMenuOpen = false;
    @action
    setPopoverDisplay(bool) {
        this.isMenuOpen = bool;
    }

    constructor(props) {
        super(props);
        const {dimensions, historyLength, model, field, maxDepth} = this.props;
        this.internalDimensions = this.normalizeDimensions(dimensions);
        this.dimChooserModel = new DimensionChooserModel({
            dimensions: this.internalDimensions,
            historyLength,
            model,
            field
        });
        this.maxDepth = withDefault(maxDepth, dimensions.length);
    }

    render() {
        return div({
            className: this.baseClassName,
            items: [
                this.prepareDimensionMenu(),
                this.prepareOptionMenu()
            ]
        });
    }

    //--------------------
    // Event Handlers
    //--------------------

    onDimChange = (dim, i) => {
        this.dimChooserModel.addDim(dim, i);
    }

    onOptClick = (type) => {
        this.dimChooserModel.setDims(type);
    }

    onSaveSelected = () => {
        this.dimChooserModel.updateSelectedDims();
        this.setPopoverDisplay(false);
    }

    onCancelSelected = () => {
        this.dimChooserModel.setDims('last commit');
        this.setPopoverDisplay(false);
    }

    //--------------------
    // Rendering top-level menus
    //--------------------

    prepareDimensionMenu() {
        const {width} = this.props,
            {isMenuOpen} = this,
            {selectedDims, toRichDim} = this.dimChooserModel;
        const target = button({
            item: toRichDim(selectedDims).map(it => it.label).join(' > '),
            style: {width},
            onClick: () => this.setPopoverDisplay(true)
        });
        const dimSelects = this.renderSelectChildren();

        return popover({
            target,
            isOpen: isMenuOpen,
            targetClassName: 'xh-dim-popover',
            position: 'bottom',
            content: vbox({
                width,
                className: 'xh-dim-popover-items',
                items: [
                    ...dimSelects,
                    hbox(
                        button({
                            icon: Icon.x(),
                            intent: 'danger',
                            style: {width: '40%'},
                            onClick: () => this.onCancelSelected()
                        }),
                        button({
                            icon: Icon.check(),
                            intent: 'success',
                            style: {width: '60%'},
                            onClick: () => this.onSaveSelected()
                        })
                    )
                ]
            })
        });
    }

    prepareOptionMenu() {
        const target =  button({
            icon: Icon.ellipsisV(),
            className: 'xh-dim-options'
        });

        return popover({
            target,
            position: 'bottom-left',
            content: buttonGroup({
                vertical: true,
                className: 'xh-dim-opts-popover-items',
                items: [
                    popover({
                        disabled: isEmpty(this.dimChooserModel.history),
                        target: button({
                            className: 'xh-dim-opts-history',
                            text: 'History',
                            rightIcon: 'caret-right'
                        }),
                        position: 'auto',
                        content: this.renderHistoryItems(),
                        interactionKind: 'hover',
                        openOnTargetFocus: false
                    }),
                    button({
                        text: 'Reset defaults',
                        onClick: () => this.onOptClick('reset defaults')
                    })
                ]
            })
        });
    }

    //--------------------
    // Render popover items
    //--------------------

    renderSelectChildren() {
        const {width} = this.props,
            {selectedDims, availableDims, toRichDim} = this.dimChooserModel,
            marginIncrement = width * 5 / 100;
        let marginIndex = 0;

        const ret = selectedDims.map((dim, i) => {
            marginIndex++;
            const marginLeft = marginIncrement * marginIndex;
            return hbox({
                style: {marginLeft},
                items: [
                    select({
                        enableFilter: false,
                        options: availableDims(i),
                        value: toRichDim(dim).label,
                        onChange: (newDim) => this.onDimChange(newDim, i)
                    }),
                    button({
                        icon: Icon.x(),
                        disabled: selectedDims.length === 1,
                        onClick: () => this.dimChooserModel.removeDim(dim)
                    })
                ]
            });
        });

        return selectedDims.length === this.maxDepth || this.dimChooserModel.leafSelected ?
            ret :
            this.appendAddDim(ret);
    }

    appendAddDim(ret) {
        const {selectedDims, remainingDims} = this.dimChooserModel;
        const marginLeft = (selectedDims.length + 1) * this.props.width * 5 / 100;
        ret.push(
            box({
                style: {marginLeft},
                items: [
                    select({
                        enableFilter: false,
                        options: remainingDims,
                        onChange: (newDim) => this.onDimChange(newDim, selectedDims.length),
                        placeholder: 'Add...'
                    }),
                    hspacer(30)
                ]
            })
        );
        return ret;

    }

    renderHistoryItems() {
        const {history, toRichDim, setDimsFromHistory} = this.dimChooserModel;
        return buttonGroup({
            className: 'xh-dim-history-items',
            vertical: true,
            items: [
                history.map((h, i) => {
                    h = toRichDim(h);
                    return button({
                        text: `${i+1}. ${h.map(it => it.label).join(' > ')}`,
                        onClick: () => setDimsFromHistory(h.value),
                        className: Classes.POPOVER_DISMISS,
                        key: `dim-history-${i}`
                    });
                })
            ]
        });
    }

    //-------------------------
    // Options / value handling
    //-------------------------

    normalizeDimensions(dims) {
        dims = dims || [];
        return dims.map(it => this.toRichDimension(it));
    }

    toRichDimension(src) {
        const srcIsObject = isPlainObject(src);

        throwIf(
            srcIsObject && !src.hasOwnProperty('value'),
            "Select options/values provided as Objects must define a 'value' property."
        );

        return srcIsObject ?
            {label: withDefault(src.label, src.value), isLeafColumn: withDefault(src.leaf, false), ...src} :
            {label: src != null ? src.toString() : '-null-', value: src, isLeafColumn: false};
    }
}

export const dimensionChooser = elemFactory(DimensionChooser);