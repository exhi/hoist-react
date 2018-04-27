/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {Component} from 'react';
import {PropTypes as PT} from 'prop-types';
import {elemFactory, hoistComponent} from 'hoist/core';
import {button, inputGroup} from 'hoist/kit/blueprint';
import {observable, setter} from 'hoist/mobx';
import {escapeRegExp} from 'lodash';

/**
 * A Component that can bind to a LeftRightChooser and filter both lists
 * based on simple text matching in selected fields.
 */
@hoistComponent()
class LeftRightChooserFilter extends Component {

    static propTypes = {
        /** width of field, in pixels */
        fields: PT.arrayOf(PT.string)
    };

    static defaultProps = {
        fields: []
    };

    @setter @observable value = '';

    render() {
        return inputGroup({
            placeholder: 'Quick filter...',
            value: this.value,
            onChange: this.onValueChange,
            rightElement: button({
                cls: 'pt-minimal pt-icon-cross',
                onClick: this.onClearClick
            })
        });
    }

    onValueChange = (e) => {
        this.setValue(e.target.value);
        this.runFilter();
    }

    onClearClick = () => {
        this.setValue('');
        this.runFilter();
    }
    
    runFilter() {
        const {fields} = this.props,
            searchTerm = escapeRegExp(this.value);

        const filter = (raw) => {
            return fields.some(f => {
                const fieldVal = !!searchTerm && raw[f];
                return ((fieldVal && new RegExp(`(^|\\\\W)${searchTerm}`, 'ig').test(fieldVal)) || !fieldVal);
            });
        };

        this.model.setDisplayFilter(filter);
    }
}
export const leftRightChooserFilter = elemFactory(LeftRightChooserFilter);