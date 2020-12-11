/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import ReactDOM from 'react-dom';
import {HoistInputPropTypes, HoistInputModel, useHoistInputModel} from '@xh/hoist/cmp/input';
import {hoistCmp} from '@xh/hoist/core';
import {radio, radioGroup} from '@xh/hoist/kit/blueprint';
import {action, observable} from '@xh/hoist/mobx';
import {withDefault} from '@xh/hoist/utils/js';
import {filter, isObject} from 'lodash';
import PT from 'prop-types';
import './RadioInput.scss';

/**
 * An input for managing Radio Buttons.
 */
export const [RadioInput, radioInput] = hoistCmp.withFactory({
    displayName: 'RadioInput',
    className: 'xh-radio-input',
    render(props, ref) {
        return useHoistInputModel(cmp, props, ref, Model);
    }
});
RadioInput.propTypes = {
    ...HoistInputPropTypes,
    /** True to display each radio button inline with each other. */
    inline: PT.bool,

    /** Alignment of each option's label relative its radio button, default right. */
    labelAlign: PT.oneOf(['left', 'right']),

    /**
     * Array of available options, of the form:
     *
     *      [{value: string, label: string, disabled: bool}, ...]
     *          - or -
     *      [val, val, ...]
     */
    options: PT.arrayOf(PT.oneOfType([PT.object, PT.string]))
};

//-----------------------
// Implementation
//-----------------------
class Model extends HoistInputModel {

    blur() {
        this.enabledRadioInputs[0]?.blur();
    }

    onBlur = (e) => {
        const noBtnsFocused = this.enabledRadioInputs.every(it => !it.focused);

        if (noBtnsFocused) {
            // noting blur for entire button group, not a single button within
            this.noteBlurred();
        }
    };

    focus() {
        this.enabledRadioInputs[0]?.focus();
    }

    get enabledRadioInputs() {
        const btns = ReactDOM.findDOMNode(this.domRef.current)
            .querySelectorAll('input');
    
        return filter(btns, {disabled: false});
    }

    @observable.ref internalOptions = [];

    @action setInternalOptions(options) {
        this.internalOptions = options;
    }

    constructor(props) {
        super(props);
        this.addReaction({
            track: () => this.props.options,
            run: (opts) => {
                opts = this.normalizeOptions(opts);
                this.setInternalOptions(opts);
            },
            fireImmediately: true
        });
    }

    //-------------------------
    // Options / value handling
    //-------------------------
    normalizeOptions(options) {
        options = options || [];
        return options.map(o => {
            const ret = isObject(o) ?
                {label: o.label, value: o.value, disabled: o.disabled} :
                {label: o.toString(), value: o};

            ret.value = this.toInternal(ret.value);
            return ret;
        });
    }

    onChange = (e) => {
        this.noteValueChange(e.target.value);
    }
}

const cmp = hoistCmp.factory(
    ({model, className, ...props}, ref) => {
        const {internalOptions} = model,
            labelAlign = withDefault(props.labelAlign, 'right');

        const items = internalOptions.map(opt => {
            return radio({
                alignIndicator: labelAlign === 'left' ? 'right' : 'left',
                disabled: opt.disabled,
                label: opt.label,
                value: opt.value,
                className: 'xh-radio-input-option',
                onFocus: (e) => {
                    model.onFocus();
                    opt.onFocus ? opt.onFocus(e) : null;
                },
                onBlur: (e) => {
                    model.onBlur(e);
                    opt.onFocus ? opt.onBlur(e) : null;
                }
            });
        });

        return radioGroup({
            className,
            items,
            disabled: props.disabled,
            inline: props.inline,
            selectedValue: model.renderValue,
            onChange: model.onChange,
            ref
        });
    }
);