/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {page, toolbar} from '@xh/hoist/kit/onsen';
import {div, vframe, vbox} from '@xh/hoist/cmp/layout';
import {button} from '@xh/hoist/mobile/cmp/button';
import {textInput} from '@xh/hoist/mobile/cmp/input';
import {Icon} from '@xh/hoist/icon';

import './LoginPanel.scss';
import {LoginPanelModel} from '@xh/hoist/core/appcontainer/LoginPanelModel';

/**
 *
 * Support for Forms based authentication
 *
 * @private
 */
@HoistComponent
export class LoginPanel extends Component {

    static modelClass = LoginPanelModel;

    render() {
        const {loginMessage} = XH.appSpec,
            {model} = this;

        return page({
            renderToolbar: () => toolbar(
                div({
                    className: 'center',
                    item: XH.clientAppName
                })
            ),
            items: [
                vframe({
                    className: 'xh-login',
                    items: [
                        vbox({
                            className: 'xh-login__fields',
                            items: [
                                textInput({
                                    model,
                                    bind: 'username',
                                    placeholder: 'Username...',
                                    commitOnChange: true
                                }),
                                textInput({
                                    model,
                                    bind: 'password',
                                    placeholder: 'Password...',
                                    type: 'password',
                                    commitOnChange: true
                                })
                            ]
                        }),
                        div({
                            className: 'xh-login__warning',
                            omit: !model.warning,
                            item: model.warning
                        }),
                        div({
                            className: 'xh-login__message',
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