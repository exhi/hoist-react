/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import PT from 'prop-types';
import {hoistCmpAndFactory, useContextModel, uses} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {errorIf, withDefault} from '@xh/hoist/utils/js';

/**
 * Convenience Button preconfigured for use as a trigger for a refresh operation.
 *
 * If a model is provided it will be directly refreshed.  Alternatively an onClick handler
 * may be provided.  If neither of these props are provided, the contextual RefreshContextModel
 * for this button will be used.
 */
export const [RefreshButton, refreshButton] = hoistCmpAndFactory({
    displayName: 'RefreshButton',

    render({model, onClick, ...props}) {
        const refreshContextModel = useContextModel('RefreshContextModel');

        if (!onClick) {
            errorIf(model && !model.isLoadSupport, 'Provided model to RefreshButton must be decorated with LoadSupport.');
            model = withDefault(model, refreshContextModel);
            onClick = model ? () => model.refreshAsync() : null;
        }

        return button({
            icon: Icon.sync(),
            onClick,
            ...props
        });
    }
});

RefreshButton.propTypes = {
    icon: PT.element,

    /** Function to call when the button is clicked. */
    onClick: PT.func,

    /** HoistModel to refresh. */
    model: PT.object
};
