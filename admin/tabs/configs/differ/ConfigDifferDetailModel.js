/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {observable, setter} from 'hoist/mobx';

export class ConfigDifferDetailModel  {

    @setter @observable isOpen = false;
    @setter record = null;

    showDetail(rec) {
        this.setRecord(rec);
        this.setIsOpen(true);
    }

}