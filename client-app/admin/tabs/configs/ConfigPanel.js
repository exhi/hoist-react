/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {observer} from 'hoist/mobx';
import {environmentService} from 'hoist/app';
import {boolCheckCol, baseCol} from 'hoist/columns/Core';
import {restGrid, RestGridModel} from 'hoist/rest';

import {nameCol} from 'hoist/admin/columns/Columns';

@observer
export class ConfigPanel extends Component {

    model = new RestGridModel({
        url: 'rest/configAdmin',
        actionWarning: {
            edit: 'Are you sure you want to edit? Editing configs can break running apps!',
            del: 'Are you sure you want to delete? Deleting configs can break running apps!'
        },
        recordSpec: {
            fields: this.filterForEnv([
                {name: 'name', label: 'Name'},
                {name: 'groupName', label: 'Group', lookup: 'groupNames'},
                {name: 'valueType', label: 'Type', lookup: 'valueTypes'},
                {name: 'prodValue', label: 'Prod Value', typeField: 'valueType', env: 'Production'},
                {name: 'betaValue', label: 'Beta Value', typeField: 'valueType', env: 'Beta', allowNull: true},
                {name: 'stageValue', label: 'Stage Value', typeField: 'valueType', env: 'Staging', allowNull: true},
                {name: 'devValue', label: 'Dev Value', typeField: 'valueType', env: 'Development', allowNull: true},
                {name: 'clientVisible', label: 'Client?', type: 'bool', defaultValue: false},
                {name: 'note', label: 'Note', allowNull: true},
                {name: 'lastUpdated', label: 'Last Updated', allowNull: true},
                {name: 'lastUpdatedBy', label: 'Last Updated By', allowNull: true}
            ])
        },
        columns: this.filterForEnv([
            nameCol(),
            baseCol({field: 'valueType', width: 100}),
            baseCol({field: 'groupName', width: 100}),
            this.valCol({field: 'prodValue', env: 'Production'}),
            this.valCol({field: 'betaValue', env: 'Beta'}),
            this.valCol({field: 'stageValue', env: 'Staging'}),
            this.valCol({field: 'devValue', env: 'Development'}),
            boolCheckCol({field: 'clientVisible', width: 90}),
            baseCol({field: 'note', flex: 1})
        ]),
        editors: this.filterForEnv([
            {field: 'name'},
            {field: 'groupName'},
            {field: 'valueType', additionsOnly: true, editable: false},
            {field: 'prodValue', env: 'Production'},
            {field: 'betaValue', env: 'Beta'},
            {field: 'stageValue', env: 'Staging'},
            {field: 'devValue', env: 'Development'},
            {field: 'clientVisible'},
            {field: 'note', type: 'textarea'},
            {field: 'lastUpdated', type: 'displayField'},
            {field: 'lastUpdatedBy', type: 'displayField'}
        ])
    });

    render() {
        return restGrid({model: this.model});
    }

    loadAsync() {
        return this.model.loadAsync();
    }


    //-------------------------
    // Implementation
    //-------------------------
    filterForEnv(vals) {
        const envs = environmentService.get('supportedEnvironments'),
            ret = vals.filter(it => !it.env || envs.includes(it.env));

        ret.forEach(it => delete it.env);
        return ret;
    }

    valCol(params) {
        return baseCol({...params, width: 175});
    }

}
