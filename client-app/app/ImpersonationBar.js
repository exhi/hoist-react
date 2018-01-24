/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {Component} from 'react';
import {wait} from 'hoist/promise';
import {XH, identityService, hoistAppStore} from 'hoist';
import {hbox, vbox, spacer, filler, div} from 'hoist/layout';
import {Classes, button, suggest, icon, popover, menuItem} from 'hoist/blueprint';

import {observable, action, observer} from 'hoist/mobx';

@observer
export class ImpersonationBar extends Component {

    store = new Store();

    constructor() {
        super();
        document.addEventListener('keydown', this.onKeyDown);
    }

    render() {
        if (!this.store.isVisible) return null;

        const {impersonating, username} = identityService;
        
        return hbox({
            padding: 5,
            style: {
                color: 'white',
                backgroundColor: 'midnightblue'
            },
            alignItems: 'center',
            items: [
                icon({iconName: 'person'}),
                spacer({width: 10}),
                div(`${impersonating ? 'Impersonating' : ''} ${username}`),
                filler(),
                this.switchButton(),
                spacer({width: 4}),
                this.exitButton()
            ]
        });
    }

    switchButton() {
        const s = this.store;

        return popover({
            target: button({text: 'Switch User', iconName: 'random', style: {minWidth: 130}, onClick: s.openTargetDialog}),
            isOpen: s.targetDialogOpen,
            hasBackdrop: true,
            minimal: true,
            placement: 'bottom-end',
            popoverClassName: 'pt-popover-content-sizing',
            backdropProps: {style: {backgroundColor: 'rgba(255,255,255,0.5)'}},
            onClose: s.closeTargetDialog,
            content: vbox({
                justifyContent: 'right',
                items: [
                    suggest({
                        inputProps: {value: s.selectedTarget},
                        onItemSelect: s.setSelectedTarget,
                        popoverProps: {popoverClassName: Classes.MINIMAL},
                        inputValueRenderer: s => s,
                        itemPredicate: (q, v, index) => v.includes(q),
                        itemRenderer: ({handleClick, isActive, item}) => {
                            return menuItem({key: item, onClick: handleClick, text: item});
                        },
                        $items: s.targets || []
                    }),
                    spacer({height: 5}),
                    hbox(
                        filler(),
                        button({text: 'Close', onClick: s.closeTargetDialog}),
                        spacer({width: 5}),
                        button({text: 'OK', onClick: s.doImpersonate, disabled: !s.selectedTarget})
                    )
                ]
            })
        });
    }

    exitButton() {
        const text = identityService.impersonating ?  'Exit Impersonation' : 'Cancel';
        return button({text: text, iconName: 'cross', onClick: this.store.doExit});
    }
    
    onKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'i') {
            this.store.toggleVisibility();
            e.stopPropagation();       
        }
    }
}


class Store {
    @observable isVisible = false;

    @observable targets = null;
    @observable selectedTarget = '';
    @observable targetDialogOpen = false;

    constructor() {
        this.isVisible = identityService.impersonating;
        if (this.isVisible) this.ensureTargetsLoaded();
    }

    @action
    toggleVisibility = () => {
        this.targetDialogOpen = false;
        this.isVisible = !this.isVisible || identityService.isImpersonating;
        if (this.isVisible) this.ensureTargetsLoaded();
    }

    @action
    doImpersonate = () => {
        if (this.selectedTarget) {
            wait(1000)
                .then(() => identityService.impersonateAsync(this.selectedTarget))
                .bind(hoistAppStore.appLoadState);
        }
    }

    doExit = () => {
        if (identityService.impersonating) {
            wait(1000)
                .then(() => identityService.endImpersonateAsync())
                .bind(hoistAppStore.appLoadState);
        } else {
            this.toggleVisibility();
        }
    }

    //--------------------------
    // Target dialog management
    //--------------------------
    ensureTargetsLoaded() {
        if (this.targets != null) return;
        XH.fetchJson({
            url: 'hoistImpl/impersonationTargets'
        }).then(
            this.setTargets
        ).catchDefault();
    }

    @action
    setTargets = (targets) => {
        this.targets = targets
            .map(t => t.username)
            .filter(t => t !== identityService.username);
    }


    @action
    closeTargetDialog = () => {
        this.targetDialogOpen = false;
    }

    @action
    openTargetDialog = () => {
        this.targetDialogOpen = true;
    }

    @action
    setSelectedTarget = (target) => {
        this.selectedTarget = target;
    }

}