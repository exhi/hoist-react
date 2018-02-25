/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import 'ag-grid-enterprise';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-dark.css';
import 'ag-grid/dist/styles/ag-theme-fresh.css';
import {elemFactory} from 'hoist/react';


import {AgGridReact} from 'ag-grid-react';
import {LicenseManager} from 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
    'ag-Grid_Evaluation_License_Key_Not_for_Production_100Devs15_February_2018__MTUxODY1MjgwMDAwMA==600d5a723b746ad55afff76eb446f0ad'
);

export * from './NavigateSelection';
export const agGridReact = elemFactory(AgGridReact);