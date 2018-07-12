/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {text} from '@xh/hoist/kit/blueprint';
import {XH, elemFactory, HoistComponent} from '@xh/hoist/core';
import {vspacer, box, filler, viewport} from '@xh/hoist/cmp/layout';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {textField} from '@xh/hoist/desktop/cmp/form';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {button} from '@xh/hoist/desktop/cmp/button';
import {observable, computed, setter} from '@xh/hoist/mobx';
import {Icon} from '@xh/hoist/icon';

import './LoginPanel.scss';

/**
 * A minimal username / password prompt for applications using form-based authentication.
 * Automatically created and displayed if required by AppContainer.
 *
 * @private
 */
@HoistComponent()
export class LoginPanel extends Component {

    @setter @observable username = '';
    @setter @observable password = '';
    @setter @observable warning = '';

    @computed
    get isValid() {
        return this.username && this.password;
    }

    render() {
        const {loginMessage} = XH.app;

        return viewport({
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            items: [
                panel({
                    cls: 'xh-login',
                    width: 300,
                    title: `Welcome to ${XH.appName}`,
                    items: [
                        vspacer(10),
                        textField({
                            model: this,
                            field: 'username',
                            placeholder: 'Username...',
                            autoFocus: true,
                            commitOnChange: true
                        }),
                        textField({
                            model: this,
                            field: 'password',
                            placeholder: 'Password...',
                            type: 'password',
                            commitOnChange: true
                        }),
                        text({
                            omit: !this.warning,
                            item: this.warning,
                            ellipsize: true,
                            cls: 'xh-login__warning'
                        }),
                        loginMessage ? box({
                            cls: 'xh-login__message',
                            item: loginMessage
                        }) : null
                    ],
                    bbar: toolbar(
                        filler(),
                        button({
                            text: 'Login',
                            intent: 'primary',
                            icon: Icon.login(),
                            disabled: !this.isValid,
                            onClick: this.onSubmit
                        })
                    )
                })
            ]
        });
    }


    //------------------------
    // Implementation
    //------------------------
    onSubmit = () => {
        const {username, password} = this;
        return XH.fetchJson({
            url: 'auth/login',
            params: {username, password}
        }).then(r => {
            this.setWarning(r.success ? '' : 'Login Incorrect');
            if (r.success) {
                XH.completeInitAsync();
            }
        }).catchDefault({
            hideParams: ['password']
        });
    }

    onUsernameChange = (ev) => {this.setUsername(ev.target.value)}
    onPasswordChange = (ev) => {this.setPassword(ev.target.value)}
}
export const loginPanel = elemFactory(LoginPanel);