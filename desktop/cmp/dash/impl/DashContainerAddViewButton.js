/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {HoistModel, hoistCmp, creates} from '@xh/hoist/core';
import {observable, action} from '@xh/hoist/mobx';
import {vbox, div} from '@xh/hoist/cmp/layout';
import {popover, Position, PopoverInteractionKind} from '@xh/hoist/kit/blueprint';
import {elementFromContent, createObservableRef} from '@xh/hoist/utils/react';
import {button} from '@xh/hoist/desktop/cmp/button';
import {Icon} from '@xh/hoist/icon';

import './DashContainerAddViewButton.scss';

/**
 * Button and popover for adding views to a DashContainer. Apps can customize the
 * popover's content via DashContainerModel's `addViewContent` config.
 *
 * @see DashContainerModel
 * @private
 */
export const dashContainerAddViewButton = hoistCmp.factory({
    model: creates(() => new Model()),
    render({model, stack, dashContainerModel}) {
        return popover({
            isOpen: model.isOpen,
            popoverClassName: 'xh-dash-container-add-view-popover xh-popup--framed',
            position: Position.BOTTOM_RIGHT,
            interactionKind: PopoverInteractionKind.CLICK_TARGET_ONLY,
            target: button({
                icon: Icon.add(),
                title: 'Add view',
                className: 'xh-dash-container-add-view-btn'
            }),
            content: vbox({
                ref: model.popoverRef,
                items: [
                    div({className: 'xh-popup__title', item: 'Add View'}),
                    elementFromContent(dashContainerModel.addViewContent, {
                        stack,
                        dashContainerModel,
                        popoverModel: model
                    })
                ],
                onBlur: (ev) => model.onBlur(ev)
            }),
            onInteraction: (willOpen) => {
                if (willOpen) {
                    model.open();
                } else {
                    model.close();
                }
            }
        });
    }
});

@HoistModel
class Model {
    @observable isOpen = false;
    popoverRef = createObservableRef();

    @action
    open() {
        this.isOpen = true;
    }

    @action
    close() {
        this.isOpen = false;
    }

    onBlur(ev) {
        // Ignore focus jumping internally from *within* the control.
        let elem = ev.relatedTarget;
        for (let thisElem = this.popoverRef.current; elem; elem = elem.parentElement) {
            if (elem == thisElem) return;
        }

        this.close();
    }
}