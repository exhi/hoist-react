/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {hoistComponent, elemFactory} from 'hoist/core';
import {div, frame} from 'hoist/layout';
import {defaults, differenceBy, isString} from 'lodash';

import './ag-grid';
import {navigateSelection, agGridReact} from './ag-grid';
import './Grid.css';

/**
 * Grid Component
 */
@hoistComponent()
class Grid extends Component {

    static gridDefaults = {
        enableSorting: true,
        enableColResize: true,
        deltaRowDataMode: true,
        getRowNodeId: (data) => data.id,
        rowSelection: 'single',
        allowContextMenuWithControlKey: true
    };

    constructor(props) {
        super(props);
        this.gridOptions = defaults(
            props.gridOptions || {},
            Grid.gridDefaults,
            {navigateToNextCell: this.onNavigateToNextCell}
        );
        this.addAutoRun(() => this.syncSelection());
    }

    render() {
        const {store, columns} = this.model;
        return frame(
            div({
                style: {flex: '1 1 auto', overflow: 'hidden'},
                cls: this.darkTheme ? 'ag-theme-dark' : 'ag-theme-fresh',
                item: agGridReact({
                    rowData: store.records,
                    columnDefs: columns,
                    onSelectionChanged: this.onSelectionChanged,
                    onGridReady: this.onGridReady,
                    gridOptions: this.gridOptions,
                    getContextMenuItems: this.getContextMenuItems
                })
            })
        );
    }

    //------------------------
    // Implementation
    //------------------------
    onGridReady = (params) => {
        this.model.gridApi = params.api;
    }
    
    onSelectionChanged = (ev) => {
        const selection = this.model.selection;
        selection.select(ev.api.getSelectedRows());
    }

    onNavigateToNextCell = (params) => {
        return navigateSelection(params, this.gridOptions.api);
    }

    getContextMenuItems = (params) => {

        // TODO: Display this as Blueprint Context menu, with code similar to below?

        // const men = contextMenu({
        //    menuItems: [{
        //        text: 'Reload App',
        //        icon: Icon.refresh(),
        //        action: () => hoistModel.reloadApp()
        //    }, {
        //        text: 'About',
        //        icon: Icon.info(),
        //        action: () => hoistModel.setShowAbout(true)
        //    }]
        // });
        // ContextMenu.show(men, { left:0, top:0}, () => {});


        const menuFn = this.model.contextMenuFn;
        if (!menuFn) return null;

        const menu = menuFn(params);
        return menu.items.map((it) => {
            if (it === '-') return 'separator';
            if (isString(it)) return it;

            return {
                name: it.text,
                icon: it.icon,
                action: it.action,
                disabled: it.disabled
            };
        });
    }

    syncSelection() {
        const api = this.gridOptions.api,
            modelSelection = this.model.selection.records,
            gridSelection = api.getSelectedRows(),
            diff = differenceBy(modelSelection, gridSelection, 'id');

        // If ag-grid's selection differs from the selection model, set it to match
        if (diff.length > 0) {
            api.deselectAll();
            modelSelection.forEach((record) => {
                const node = api.getRowNode(record.id);
                node.setSelected(true);
                api.ensureNodeVisible(node);
            });
        }
    }
}
export const grid = elemFactory(Grid);