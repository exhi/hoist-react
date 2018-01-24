import {Component} from 'react';
import {XH, elemFactory} from 'hoist';
import {gridPanel} from 'hoist/ag-grid/GridPanel';
import {observer, observable, action, toJS} from 'hoist/mobx';
import {box} from 'hoist/layout';

import {restForm} from 'hoist/rest/RestForm';


@observer
export class RestGrid extends Component {

    @observable rows = null;
    @observable _rec = null;

    render() {
        const formProps = { // define on grid and pass as prop? Yes.
            rec: this._rec,
            title: this._rec ? this._rec.name : 'Record', // some recs don't have names. Move this to specific grids for more granular control
            editors: this.props.editors,
            url: this.url
        };

        return box({
            flex: 1,
            items: [
                gridPanel({
                    rows: toJS(this.rows),
                    columns: this.props.columns,
                    gridOptions: {
                        onRowDoubleClicked: this.onRowDoubleClicked
                    }
                }),
                restForm(formProps)
            ]
        });
    }

    loadAsync() {
        return XH
            .fetchJson({url: this.props.url})
            .then(rows => {
                this.completeLoad(true, rows.data);
            }).catch(e => {
                this.completeLoad(false, e);
                XH.handleException(e);
            });
    }

    @action
    completeLoad = (success, vals) => {
        this.rows = success ? vals : [];
    }

    @action
    onRowDoubleClicked = (arg) => {
        const rec = arg.data;
        this._rec = rec;
    }
}

export const restGrid = elemFactory(RestGrid);