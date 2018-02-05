/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import 'ag-grid-enterprise';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-fresh.css';

import {Component} from 'react';
import {elemFactory} from 'hoist';
import {div} from 'hoist/layout';
import {observer, action, toJS} from 'hoist/mobx';

import {defaults} from 'lodash';
import {AgGridReact} from 'ag-grid-react';
import {LicenseManager} from 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
    'ag-Grid_Evaluation_License_Key_Not_for_Production_100Devs15_February_2018__MTUxODY1MjgwMDAwMA==600d5a723b746ad55afff76eb446f0ad'
);
const agGridReact = elemFactory(AgGridReact);

/**
 * Grid Component
 */
@observer
class Grid extends Component {

    static gridDefaults = {
        enableSorting: true,
        enableColResize: true,
        rowSelection: 'single'
    };

    render() {
        const props = this.props,
            model = this.model,
            gridOptions = defaults(props.gridOptions || {}, Grid.gridDefaults);

        return div({
            style: {flex: '1 1 auto'},
            cls: 'ag-theme-fresh',
            item: agGridReact({
                rowData: toJS(model.records),
                columnDefs: model.columns,
                onSelectionChanged: this.onSelectionChanged,
                onGridSizeChanged: this.onGridSizeChanged,
                gridOptions
            })
        });
    }

    //----------------
    // Implementation
    //-----------------
    get model() {return this.props.model}

    onGridSizeChanged = (ev) => {
        ev.api.sizeColumnsToFit();
    }

    @action
    onSelectionChanged = (ev) => {
        const selection = this.model.selection;
        selection.setRecords(ev.api.getSelectedRows());
    }
}
export const grid = elemFactory(Grid);