/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {AgGridReact} from '@ag-grid-community/react';
import '@ag-grid-enterprise/all-modules';
import {AllCommunityModules, ModuleRegistry} from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import {elemFactory} from '@xh/hoist/core';


// TODO - app-level plan for module/license registration
ModuleRegistry.registerModules(AllCommunityModules);

// Set via webpack.DefinePlugin at build time - see @xh/hoist-dev-utils/configureWebpack
LicenseManager.setLicenseKey(xhAgGridLicenseKey);

export * from './AgGridModel';
export * from './AgGrid';
export const agGridReact = elemFactory(AgGridReact);