import {Component} from 'react';
import {div} from 'hoist/layout/index';
import {Icon} from 'hoist/icon/index';

export class ItemRenderer extends Component {

    render() {
        const {value, data} = this.props,
            lockedText = Icon.lock({cls: 'medium-gray', prefix: 'fal'});

        return div({
            cls: 'item-row',
            items: [
                value,
                data.locked ? lockedText : null
            ]
        });
    }

}