/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {hoistElemFactory, useModel} from '@xh/hoist/core';
import {fragment} from '@xh/hoist/cmp/layout';
import {message} from './Message';
import {MessageSourceModel} from '@xh/hoist/appcontainer/MessageSourceModel';

/**
 *  Support for publishing multiple Messages in the DOM.
 *
 *  @private
 */
export const messageSource = hoistElemFactory(
    props => {
        const model = useModel(MessageSourceModel, props),
            models = model.msgModels,
            children = models.map(model => message({model, key: model.xhId}));
        return children.length ? fragment(...children) : null;
    }
);
