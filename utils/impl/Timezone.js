/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HOURS} from '@xh/hoist/utils/datetime';
import {fmtNumber} from '@xh/hoist/format';


/**
 * @private
 *
 * Pending additional support for client-side Timezone API
 */
export function fmtTimezone(name, offset) {
    return name != 'GMT' ?
        `${name} (GMT${fmtNumber(offset/HOURS, {withPlusSign: true})})` :
        `${name}`;
}