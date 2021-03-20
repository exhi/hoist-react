/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2021 Extremely Heavy Industries Inc.
 */
import {GridModel} from '@xh/hoist/cmp/grid';
import {hoistCmp, useContextModel, useLocalModel, XH} from '@xh/hoist/core';
import {Store} from '@xh/hoist/data';
import {storeFilterFieldImpl as desktopStoreFilterFieldImpl} from '@xh/hoist/dynamics/desktop';
import {storeFilterFieldImpl as mobileStoreFilterFieldImpl} from '@xh/hoist/dynamics/mobile';
import {throwIf, withDefault} from '@xh/hoist/utils/js';
import PT from 'prop-types';
import {StoreFilterFieldImplModel} from './impl/StoreFilterFieldImplModel';

/**
 * A text input Component that generates a filter function based on simple word-boundary matching of
 * its value to the value of configured fields on a candidate object. If any field values match, the
 * object itself is considered a match.
 *
 * This component is designed to be bound to a Store via either its `store` OR `gridModel` props.
 * (If not configured to bind to a specific Store or GridModel, this component will bind by default
 * to the store of the nearest GridModel found in context.) Binding in this way allows the component
 * to auto-generate the fields in the store to be included in the filter, and also to automatically
 * apply the filter to the Store.
 *
 * In cases where the application is combining this filter with other filters, or applying
 * additional application logic, the filter can be managed manually, by setting `autoApply` to
 * `false`, and using the `onFilterChange` callback instead.
 *
 * Fields to be searched can be automatically determined from the bound Store or GridModel, and/or
 * customized via the include/excludeFields props. See prop comments for details.
 *
 * This component supports all props available to TextInput and will pass them along to its
 * underlying TextInput.
 */
export const [StoreFilterField, storeFilterField] = hoistCmp.withFactory({
    displayName: 'StoreFilterField',
    className: 'xh-store-filter-field',

    render({gridModel, store, ...props}) {
        throwIf(gridModel && store, "Cannot specify both 'gridModel' and 'store' props.");
        if (!store) {
            gridModel = withDefault(gridModel, useContextModel(GridModel));
            store = gridModel?.store ?? null;
        }

        const impl = useLocalModel(() => new StoreFilterFieldImplModel({gridModel, store, ...props}));
        impl.updateFilterProps(props);
        return XH.isMobileApp ?
            mobileStoreFilterFieldImpl({...props, model: impl, bind: 'filterText'}) :
            desktopStoreFilterFieldImpl({...props, model: impl, bind: 'filterText'});
    }
});

StoreFilterField.propTypes = {

    /**
     * Automatically apply the filter to bound store.  Defaults to true.  Applications
     * that need to combine this filter with other filters, or otherwise manage its
     * application manually should set this to false.
     */
    autoApply: PT.bool,

    /**
     * Field on optional model to which this component should bind its value. Specify this
     * field to control the state of this component.
     */
    bind: PT.string,

    /** Names of field(s) to exclude from search. Cannot be used with `includeFields`. */
    excludeFields: PT.arrayOf(PT.string),

    /**
     * Delay (in ms) to buffer filtering of the store after the value changes from user input.
     * Default 200ms. Set to 0 to filter immediately on each keystroke. Applicable only when
     * bound to a Store (directly or via a GridModel).
     */
    filterBuffer: PT.number,

    /**
     * GridModel whose Store this control should filter. When given a GridModel, this component
     * will, by default, use the fields for all *visible* columns when matching, as well as any
     * groupBy field. Do not configure this and `store` on the same component.
     */
    gridModel: PT.instanceOf(GridModel),

    /**
     * Names of field(s) to include in search. Required if neither a store nor gridModel are
     * provided, as otherwise fields cannot be inferred.
     *
     * Can be used along with a gridModel to ensure a field is included, regardless of column
     * visibility. Cannot be used with `excludeFields`.
     */
    includeFields: PT.arrayOf(PT.string),

    /** Mode to use when filtering (default 'startWord'). */
    matchMode: PT.oneOf(['start', 'startWord', 'any']),

    /** Optional model for value binding - see comments on the `bind` prop for details. */
    model: PT.object,

    /**
     * Callback to receive an updated Filter. Typically used in conjunction with `autoApply`
     * false, in order to manually apply the filter of this component to a store.
     * NOTE that calls to this function are NOT buffered and will be made on each keystroke.
     */
    onFilterChange: PT.func,

    /** Text to display when the input is empty. */
    placeholder: PT.string,

    /**
     * Store that this control should filter. By default, all fields configured on the Store
     * will be used for matching. Do not configure this and `gridModel` on the same component.
     */
    store: PT.instanceOf(Store),

    /** Width of the input in pixels. */
    width: PT.number

};
