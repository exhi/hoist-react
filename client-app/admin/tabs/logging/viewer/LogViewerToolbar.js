/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {elemFactory} from 'hoist';
import {inputGroup, numericInput, checkbox, button} from 'hoist/kit/blueprint';
import {observer} from 'hoist/mobx';
import {hbox, filler, hspacer, div} from 'hoist/layout';

@observer
class LogViewerToolbar extends Component {
    
    render() {
        const {startLine, maxLines, pattern, tail} = this.model;

        return hbox({
            flex: 'none',
            padding: 3,
            alignItems: 'center',
            style: {background: '#106ba3'},
            items: [
                this.label('Start Line:'),
                hspacer(8),
                this.numericInput({
                    value: startLine,
                    min: 0,
                    onValueChange: this.onStartLineChange
                }),
                hspacer(10),
                this.label('Max Lines:'),
                hspacer(8),
                this.numericInput({
                    value: maxLines,
                    min: 1,
                    onValueChange: this.onMaxLinesChange
                }),
                hspacer(10),
                inputGroup({
                    placeholder: 'Search...',
                    style: {width: 150},
                    value: pattern,
                    onChange: this.onPatternChange
                }),
                hspacer(10),
                checkbox({
                    name: 'tail',
                    style: {marginBottom: '0px', marginRight: '0px'},
                    label: this.label('Tail'),
                    checked: tail,
                    inline: true,
                    onChange: this.onTailChange
                }),
                filler(),
                button({
                    icon: 'refresh',
                    onClick: this.onSubmitClick
                })
            ]
        });
    }

    //-----------------------------
    // Implementation
    //-----------------------------
    onSubmitClick = () => {
        this.model.loadLines();
    };

    onStartLineChange = (value) => {
        this.model.setDisplayOption('startLine', value);
    }

    onMaxLinesChange = (value) => {
        this.model.setDisplayOption('maxLines', value);
    }

    onPatternChange = (e) => {
        this.model.setDisplayOption('pattern', e.target.value);
    }

    onTailChange = (e) => {
        this.model.setDisplayOption('tail', e.target.checked);
    }
    
    label(txt) {
        // Default label object has trouble with inline
        return div({
            cls: 'pt-label pt-inline',
            style: {color: 'white', whiteSpace: 'nowrap'},
            item: txt
        });
    }

    numericInput(args) {
        return numericInput({style: {width: 50}, buttonPosition: 'none', ...args});
    }

    get model() {return this.props.model}
}
export const logViewerToolbar = elemFactory(LogViewerToolbar);