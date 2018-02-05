/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory} from 'hoist';
import {button, input, checkbox} from 'hoist/kit/semantic';
import {observer} from 'hoist/mobx';

@observer
class LogViewerPanelToolbar extends Component {
    render() {
        const {startLine, maxLines, tail, refreshValues} = this.model;
        return [
            input({
                label: 'Start Line',
                defaultValue: startLine,
                size: 'mini',
                input: {
                    style: {
                        width: '70px'
                    }
                }
            }),
            input({
                label: 'Max Lines',
                defaultValue: maxLines,
                size: 'mini',
                input: {
                    style: {
                        width: '70px'
                    }
                }
            }),
            input({
                icon: {name: 'search'},
                placeholder: 'Search...',
                size: 'mini'
            }),
            button({
                icon: {name: 'refresh'},
                size: 'mini',
                onClick: refreshValues()
            }),
            checkbox({
                label: 'Tail',
                size: 'mini',
                checked: tail
            })
        ];
    }

    get model() {
        return this.props.model;
    }
}

export const logViewerPanelToolbar = elemFactory(LogViewerPanelToolbar);