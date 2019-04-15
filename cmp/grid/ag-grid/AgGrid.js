/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent, elemFactory, LayoutSupport, XH} from '@xh/hoist/core';
import {omit} from 'lodash';

import {agGridReact, AgGridModel} from './index';
import './AgGrid.scss';
import {frame} from '../../layout';

/**
 * Wrapper for AgGridReact
 */
@HoistComponent
@LayoutSupport
export class AgGrid extends Component {
    baseClassName = 'xh-ag-grid';
    modelClass = AgGridModel;

    static get ROW_HEIGHT() {return XH.isMobile ? 34 : 28}

    static get COMPACT_ROW_HEIGHT() {return XH.isMobile ? 30 : 24}

    constructor(props) {
        super(props);

        const {model} = this;
        this.addReaction({
            track: () => [model.isReady, model.compact],
            run: ([isReady]) => {
                if (!isReady) return;
                model.agApi.resetRowHeights();
            }
        });
    }

    render() {
        const layoutProps = this.getLayoutProps(),
            agGridProps = omit(this.getNonLayoutProps(), ['model', 'key']);

        const {compact, rowBorders, stripeRows, showCellFocus, showHover} = this.model,
            {darkTheme, isMobile} = XH;

        return frame({
            className: this.getClassName(
                darkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham',
                compact ? 'xh-ag-grid--compact' : 'xh-ag-grid--standard',
                rowBorders ? 'xh-ag-grid--row-borders' : 'xh-ag-grid--no-row-borders',
                stripeRows ? 'xh-ag-grid--stripe-rows' : 'xh-ag-grid--no-stripe-rows',
                showCellFocus ? 'xh-ag-grid--show-cell-focus' : 'xh-ag-grid--no-cell-focus',
                !isMobile && showHover ? 'xh-ag-grid--show-hover' : 'xh-ag-grid--no-hover'
            ),
            ...layoutProps,
            item: agGridReact({
                // ag-grid props which we provide defaults for, but can be overridden
                getRowHeight: this.getRowHeight,
                navigateToNextCell: this.navigateToNextCell,

                ...agGridProps,

                // ag-grid props which we do not allow to be overridden
                onGridReady: this.onGridReady
            })
        });
    }

    onGridReady = (agParams) => {
        this.model.init(agParams);
        if (this.props.init) {
            this.props.init(agParams);
        }
    };

    getRowHeight = () => {
        return this.model.compact ? AgGrid.COMPACT_ROW_HEIGHT : AgGrid.ROW_HEIGHT;
    };

    navigateToNextCell = (agParams) => {
        if (XH.isMobile) return;

        const {nextCellDef, previousCellDef, event, api} = agParams,
            shiftKey = event.shiftKey,
            prevIndex = previousCellDef ? previousCellDef.rowIndex : null,
            nextIndex = nextCellDef ? nextCellDef.rowIndex : null,
            prevNode = prevIndex != null ? api.getDisplayedRowAtIndex(prevIndex) : null,
            nextNode = nextIndex != null ? api.getDisplayedRowAtIndex(nextIndex) : null,
            prevNodeIsParent = prevNode && prevNode.allChildrenCount,
            KEY_UP = 38, KEY_DOWN = 40, KEY_LEFT = 37, KEY_RIGHT = 39;

        switch (agParams.key) {
            case KEY_DOWN:
            case KEY_UP:
                if (nextNode) {
                    if (!shiftKey || !prevNode.isSelected()) {
                        // 0) Simple move of selection
                        nextNode.setSelected(true, true);
                    } else {
                        // 1) Extend or shrink multi-selection.
                        if (!nextNode.isSelected()) {
                            nextNode.setSelected(true, false);
                        } else {
                            prevNode.setSelected(false, false);
                        }
                    }
                }
                return nextCellDef;
            case KEY_LEFT:
                if (prevNodeIsParent && prevNode.expanded) prevNode.setExpanded(false);
                return nextCellDef;
            case KEY_RIGHT:
                if (prevNodeIsParent && !prevNode.expanded) prevNode.setExpanded(true);
                return nextCellDef;
            default:
        }
    };
}

export const agGrid = elemFactory(AgGrid);