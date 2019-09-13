/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import PT from 'prop-types';
import {hoistCmpAndFactory, useContextModel, uses} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {Button, button} from './Button';
import {errorIf} from '@xh/hoist/utils/js';
import {withDefault} from '@xh/hoist/utils/js';

/**
 * Convenience Button preconfigured for use as a trigger for a refresh operation.
 *
 * If an onClick handler is provided it will be used. Otherwise this button will
 * be linked to any model in props implementing LoadSupport, or the contextual
 * RefreshContextModel.
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
            icon: Icon.refresh(),
            title: 'Refresh',
            intent: 'success',
            onClick,
            ...props
        });
    }
});

RefreshButton.propTypes = {
    ...Button.propTypes,

    /** HoistModel to refresh. */
    model: PT.object
};


