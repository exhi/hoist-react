/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {debounce} from 'lodash';
import {XH} from 'hoist/app';
import {action, observable, setter, autorun} from 'hoist/mobx';
import {baseCol} from 'hoist/columns/Core';
import {GridModel} from 'hoist/grid';
import {LastPromiseModel} from 'hoist/promise';

export class LogViewerModel {

    // Form State/Display options
    @observable tail = true;
    @observable startLine = 1;
    @observable maxLines = 1000;
    @observable pattern = '';

    // Overall State
    @observable file = null;
    @setter @observable rows = [];

    loadModel = new LastPromiseModel();

    files = new GridModel({
        url: 'logViewerAdmin/listFiles',
        dataRoot: 'files',
        columns: [
            baseCol({headerName: 'Log File', field: 'filename', width: 250})
        ]
    });

    constructor() {
        autorun(() => {
            const sel = this.files.selection.singleRecord;
            this.file = sel ? sel.filename : null;
            this.loadLines();
        });
    }
    
    @action
    async loadAsync() {
        this.files.loadAsync();
        this.loadLines();
    }

    @action
    loadLines() {
        if (!this.file) {
            this.setRows([]);
        } else {
            this.fetchFile();
        }
    }

    @action
    setDisplayOption(name, value) {
        this[name] = value;
    }

    //-----------------
    // Implementation
    //-----------------
    fetchFile = debounce(() => {
        return XH
            .fetchJson({
                url: 'logViewerAdmin/getFile',
                params: {
                    filename: this.file,
                    startLine: this.startLine,
                    maxLines: this.maxLines,
                    pattern: this.pattern
                }
            })
            .then(rows => this.setRows(rows.content))
            .linkTo(this.loadModel)
            .catchDefault();
    }, 300);
}