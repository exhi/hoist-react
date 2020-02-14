/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import {Icon} from '@xh/hoist/icon';
import {textInput} from '@xh/hoist/desktop/cmp/input';
import {withDefault} from '@xh/hoist/utils/js';

/**
 * Desktop implementation of StoreFilterField.
 * @private
 */
export function storeFilterFieldImpl({implModel, ...props}) {
    return textInput({
        value: implModel.value,
        onChange: (v) => implModel.setValue(v, {applyImmediately: false}),
        leftIcon: Icon.filter(),
        enableClear: true,
        placeholder: 'Quick filter',
        width: 180,
        ...props,
    });
}