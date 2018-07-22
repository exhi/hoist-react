/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {page, toolbar} from '@xh/hoist/kit/onsen';
import {div, vframe, vbox} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/mobile/cmp/button';
import {textField} from '@xh/hoist/mobile/cmp/form';
import {Icon} from '@xh/hoist/icon';

import './LoginPanel.scss';

/**
 *
 * Support for Forms based authentication
 *
 * @private
 */
@HoistComponent()
export class LoginPanel extends Component {

    render() {
        const {loginMessage} = XH.app,
            {model} = this;

        return page({
            renderToolbar: () => toolbar(
                div({
                    cls: 'center',
                    item: `Welcome to ${XH.appName}`
                })
            ),
            items: [
                vframe({
                    cls: 'xh-login',
                    items: [
                        vbox({
                            cls: 'xh-login__fields',
                            items: [
                                textField({
                                    model,
                                    field: 'username',
                                    placeholder: 'Username...',
                                    commitOnChange: true
                                }),
                                textField({
                                    model,
                                    field: 'password',
                                    placeholder: 'Password...',
                                    type: 'password',
                                    commitOnChange: true
                                })
                            ]
                        }),
                        div({
                            cls: 'xh-login__warning',
                            omit: !model.warning,
                            item: model.warning
                        }),
                        div({
                            cls: 'xh-login__message',
                            omit: !loginMessage,
                            item: loginMessage
                        }),
                        button({
                            icon: Icon.login(),
                            text: 'Login',
                            modifier: 'cta',
                            disabled: !model.isValid,
                            onClick: this.onSubmit
                        })
                    ]
                })
            ]
        });
    }

    //------------------------
    // Implementation
    //------------------------
    onSubmit = () => {
        this.model.submit();
    }
}
export const loginPanel = elemFactory(LoginPanel);