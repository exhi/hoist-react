/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {elemFactory} from 'hoist/hyperscript';
import Button from 'material-ui/Button';
import {CircularProgress} from 'material-ui/Progress';
import Modal from 'material-ui/Modal';

export const button = elemFactory(Button),
    circularProgress = elemFactory(CircularProgress),
    modal = elemFactory(Modal);
