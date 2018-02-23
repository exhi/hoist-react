/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {elemFactory} from 'hoist/react';

import fontawesome from '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import solid from '@fortawesome/fontawesome-pro-solid';

export const Glyph = {
    ENVELOPE: 'envelope',
    EYE: 'eye',
    MOON: 'moon',
    REFRESH: 'sync',
    SUN: 'sun'
};

fontawesome.library.add(solid);

export const glyph = elemFactory(FontAwesomeIcon);