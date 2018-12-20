/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import React, {Component} from 'react';
import {XH, HoistComponent} from '@xh/hoist/core';
import {div, h1, h2, table, tbody, tr, th, td} from '@xh/hoist/cmp/layout';
import {fmtDateTime} from '@xh/hoist/format';

import './AboutPanel.scss';

@HoistComponent
export class AboutPanel extends Component {

    render() {
        return div({
            className: 'xh-admin-about-panel',
            items: [
                h1('About This Application'),
                ...this.renderTables(),
                this.renderBlurb()
            ]
        });
    }

    renderTables() {
        const svc = XH.environmentService,
            row = (label, data) => tr(th(label), td(data));

        // Snapshot versions are tagged with a timestamp - show that in local time here
        // to aid in identifying when/if a snapshot has been updated.
        let hrVersion = svc.get('hoistReactVersion');
        if (hrVersion.includes('SNAPSHOT.')) {
            const snapDate = new Date(parseInt(hrVersion.split('SNAPSHOT.')[1]));
            hrVersion += ` (${fmtDateTime(snapDate)})`;
        }

        return [
            table({
                item: tbody(
                    row('App', `${svc.get('appName')} (${svc.get('appCode')})`),
                    row('Environment', svc.get('appEnvironment')),
                    row('Server', svc.get('appVersion')),
                    row('Client', svc.get('clientVersion')),
                    row('Build', svc.get('clientBuild')),
                    row('Database', svc.get('databaseConnectionString')),
                    row('Database User', svc.get('databaseUser')),
                    row('DB Create Mode', svc.get('databaseCreateMode'))
                )
            }),
            h2('Framework Versions'),
            table({
                item: tbody(
                    row('Hoist Core', svc.get('hoistCoreVersion')),
                    row('Hoist React', hrVersion),
                    row('React', svc.get('reactVersion')),
                    row('Grails', svc.get('grailsVersion')),
                    row('Java', svc.get('javaVersion'))
                )
            })
        ];
    }

    renderBlurb() {
        return div({
            className: 'xh-admin-about-panel__blurb',
            items: [
                <p>
                    Built with Hoist: a plugin for rich web-application development provided by
                    <a href="http://xh.io" target="_blank" rel="noopener noreferrer"> Extremely Heavy Industries</a>.
                </p>,
                <p>Please contact <a href="mailto:support@xh.io">support@xh.io</a> with any questions.</p>
            ]
        });
    }
}
