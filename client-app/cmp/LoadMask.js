/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {box, viewport} from 'hoist/layout';
import {observer} from 'hoist/mobx';

import {modal, circularProgress} from 'hoist/kit/material';
import {overlay, spinner} from 'hoist/kit/blueprint';
import {dimmer, loader} from 'hoist/kit/semantic';


/**
 * Simple LoadMask.
 *
 * This Mask currently will occupy the entire viewport.
 * Localized masking will be provided by a future option.
 *
 * The mask can be explicitly shown, or reactively bound to a PromiseState.
 */
@observer
export class LoadMask extends Component {

    BACKGROUND = 'rgba(0,0,0, 0.25)';

    static defaultProps = {
        isDisplayed: false,
        promiseState: null
    };

    render() {
        return this.renderSemantic();
    }

    renderBlueprint() {
        const {isDisplayed, promiseState} = this.props;
        return overlay({
            isOpen: isDisplayed || promiseState.isPending,
            canEscapeKeyClose: false,
            backdropProps: {
                style: {backgroundColor: this.BACKGROUND}
            },
            items: viewport({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                items: spinner()
            })
        });
    }

    renderSemantic() {
        const {isDisplayed, promiseState} = this.props;
        return dimmer({
            active: isDisplayed || promiseState.isPending,
            page: true,
            items: loader()
        });
    }

    renderMaterial() {
        const {isDisplayed, promiseState} = this.props;
        return modal({
            open: isDisplayed || promiseState.isPending,
            disableEscapeKeyDown: true,
            BackdropProps: {
                style: {backgroundColor: this.BACKGROUND}
            },
            items: box({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                items: circularProgress()
            })
        });
    }
}
