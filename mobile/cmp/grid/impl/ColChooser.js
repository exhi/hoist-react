/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {HoistComponent, elemFactory} from '@xh/hoist/core';
import {div} from '@xh/hoist/cmp/layout';
import {dialogPanel} from '@xh/hoist/mobile/cmp/panel';
import {toolbar} from '@xh/hoist/mobile/cmp/toolbar';
import {button} from '@xh/hoist/mobile/cmp/button';
import {Icon} from '@xh/hoist/icon';
import classNames from 'classnames';

import {dragDropContext, droppable, draggable} from '@xh/hoist/kit/react-beautiful-dnd';

import './ColChooser.scss';
import {ColChooserModel} from './ColChooserModel';

/**
 * Hoist UI for user selection and discovery of available Grid columns, enabled via the
 * GridModel.enableColChooser config option.
 *
 * This component displays available columns in a list, with currently visible columns
 * identified by a checkmark icon to the right of the column name. Users can toggle column
 * visibility within its associated grid by tapping this icon.
 *
 * User can drag and drop the columns in the list to reorder them in the grid.
 *
 * It derives its configuration primary from the Grid's Column definitions.
 *
 * It is not necessary to manually create instances of this component within an application.
 */
@HoistComponent
export class ColChooser extends Component {

    static modelClass = ColChooserModel;

    render() {
        const {model} = this,
            {isOpen, gridModel, pinnedColumns, unpinnedColumns} = model;

        return dialogPanel({
            isOpen,
            title: 'Choose Columns',
            headerItems: [
                button({
                    icon: Icon.undo({size: 'sm'}),
                    style: {maxHeight: 16},
                    modifier: 'quiet',
                    omit: !gridModel.stateModel,
                    onClick: () => model.restoreDefaults()
                })
            ],
            icon: Icon.gridPanel(),
            className: 'xh-col-chooser',
            scrollable: true,
            items: [
                // 1) Render pinned columns in a static list
                this.renderColumnList(pinnedColumns),

                // 2) Render orderable columns in draggable is list
                dragDropContext({
                    onDragEnd: this.onDragEnd,
                    item: droppable({
                        droppableId: 'column-list',
                        item: (dndProps) => this.renderColumnList(unpinnedColumns, {isDraggable: true, ref: dndProps.innerRef})
                    })
                })
            ],
            bbar: toolbar({
                items: [
                    button({
                        icon: Icon.x(),
                        flex: 1,
                        onClick: () => model.close()
                    }),
                    button({
                        icon: Icon.check(),
                        flex: 1,
                        onClick: this.onOK
                    })
                ]
            })
        });
    }

    onOK = () => {
        this.model.commit();
        this.model.close();
    };

    onDragEnd = (result) => {
        const {pinnedColumns} = this.model,
            {draggableId, destination} = result;

        if (!destination) return; // dropped outside the list

        const toIdx = destination.index + pinnedColumns.length; // Account for pinned columns
        this.model.moveToIndex(draggableId, toIdx);
    };

    //------------------------
    // Implementation
    //------------------------
    renderColumnList(columns, props = {}) {
        const {isDraggable, ...rest} = props;

        return div({
            className: 'xh-col-chooser-list',
            items: columns.map((col, idx) => {
                return isDraggable ? this.renderDraggableRow(col, idx) : this.renderRow(col);
            }),
            ...rest
        });
    }

    renderDraggableRow(col, idx) {
        const {colId, exclude} = col;

        if (exclude) return;

        return draggable({
            key: colId,
            draggableId: colId,
            index: idx,
            item: (dndProps, dndState) => {
                return this.renderRow(col, {
                    isDraggable: true,
                    isDragging: dndState.isDragging,
                    ref: dndProps.innerRef,
                    ...dndProps.dragHandleProps,
                    ...dndProps.draggableProps
                });
            }
        });
    }

    renderRow(col, props = {}) {
        const {colId, text, hidden, locked, exclude} = col,
            {isDraggable, isDragging, ...rest} = props;

        if (exclude) return;

        const getButtonIcon = (locked, hidden) => {
            if (locked) return Icon.lock();
            if (hidden) return Icon.cross();
            return Icon.check({className: 'xh-green'});
        };

        return div({
            className: classNames(
                'xh-col-chooser-row',
                isDragging ? 'xh-col-chooser-row-dragging' : null
            ),
            items: [
                div({
                    className: 'xh-col-chooser-row-grabber',
                    item: isDraggable ? Icon.arrowsUpDown() : Icon.lock()
                }),
                div({
                    className: 'xh-col-chooser-row-text',
                    item: text
                }),
                button({
                    icon: getButtonIcon(locked, hidden),
                    disabled: locked,
                    modifier: 'quiet',
                    onClick: () => this.model.setHidden(colId, !hidden)
                })
            ],
            ...rest
        });
    }
}

export const colChooser = elemFactory(ColChooser);