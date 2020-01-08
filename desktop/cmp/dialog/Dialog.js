/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */

import {useEffect} from 'react';
import PT from 'prop-types';
import ReactDOM from 'react-dom';
import {castArray} from 'lodash';

import {rnd} from '@xh/hoist/kit/react-rnd';
import {hoistCmp, uses, ModelPublishMode} from '@xh/hoist/core';
import {useOnMount, useOnUnmount} from '@xh/hoist/utils/react';
import {div, vframe} from '@xh/hoist/cmp/layout';

import {DialogModel} from './DialogModel';
import {dialogHeader} from './impl/DialogHeader';

import './DialogStyles.scss';


export const [Dialog, dialog] = hoistCmp.withFactory({
    displayName: 'Panel',
    model: uses(DialogModel, {
        fromContext: true,
        publishMode: ModelPublishMode.LIMITED
    }),
    memo: false,
    className: 'xh-dialog',

    render({model, ...props}) {

        const maybeSetFocus = () => {
            // always delay focus manipulation to just before repaint to prevent scroll jumping
            window.requestAnimationFrame(() => {
                const {containerElement: container, isOpen} = model,
                    {activeElement} = document;

                // containerElement may be undefined between component mounting and Portal rendering
                // activeElement may be undefined in some rare cases in IE
                if (container == null || activeElement == null || !isOpen) return;

                const isFocusOutsideModal = !container.contains(activeElement);
                if (isFocusOutsideModal) {
                    /**
                     * @see {@link https://github.com/facebook/react/blob/9fe1031244903e442de179821f1d383a9f2a59f2/packages/react-dom/src/shared/DOMProperty.js#L294}
                     * @see {@link https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMHostConfig.js#L379}
                     * for why we do not search for autofocus on dom element: TLDR:  it's not there!
                     */
                    const wrapperElement = container.querySelector('[tabindex]');
                    if (wrapperElement != null) {
                        wrapperElement.focus();
                    }
                }
            });
        };

        useOnMount(() => {
            /**
             * @see {@link{https://reactjs.org/docs/portals.html#event-bubbling-through-portals}
             * @see {@link{https://github.com/palantir/blueprint/blob/develop/packages/core/src/components/portal/portal.tsx}
             */
            model.portalContainer = document.getElementById(model.dialogRootId);

            model.containerElement = document.createElement('div');
            model.portalContainer.appendChild(model.containerElement);
            model.setHasMounted(true);
        });

        useOnUnmount(() => {
            model.portalContainer.removeChild(model.containerElement);
        });

        useEffect(() => {
            maybeSetFocus();
            model.centerDraggableDialogOnRender();
        });

        const {draggable, resizable, isOpen, hasMounted} = model,
            isRnd = draggable || resizable;

        if (isOpen === false || !hasMounted) {
            document.body.style.overflow = null;
            return null;
        }

        // do we need to store prior overflow setting to be able to reset it when modal closes?
        document.body.style.overflow = isRnd ? 'hidden' : null;

        return ReactDOM.createPortal(
            isRnd ?
                rndDialog({model, props}) :
                plainDialog({model, props}),
            model.containerElement
        );

    }
});


const plainDialog = hoistCmp.factory(
    ({model: dialogModel, props}) => div({
        onKeyDown: (evt) => dialogModel.handleKeyDown(evt),
        onClick: (evt) => dialogModel.handleMaskClick(evt),
        onContextMenu: (evt) => dialogModel.handleMaskClick(evt),
        tabIndex: 0,
        ref: dialogModel.dialogWrapperDivRef,
        className: 'xh-dialog-root__plain',
        item: div({
            className: 'xh-dialog-root__content',
            item: content(props)
        })
    })
);

const rndDialog = hoistCmp.factory(
    ({model: dialogModel, props}) => {
        const {resizable, draggable, RnDOptions = {}} = dialogModel;

        return rnd({
            ref: c => dialogModel.rndRef = c,
            ...RnDOptions,
            default: {
                x: 0,
                y: 0
            },
            disableDragging: !draggable,
            enableResizing: {
                bottom: resizable,
                bottomLeft: resizable,
                bottomRight: resizable,
                left: resizable,
                right: resizable,
                top: resizable,
                topLeft: resizable,
                topRight: resizable
            },
            bounds: 'body',
            dragHandleClassName: 'xh-dialog-header',
            item: div({
                onKeyDown: (evt) => dialogModel.handleKeyDown(evt),
                tabIndex: 0,
                ref: dialogModel.dialogWrapperDivRef,
                className: 'react-draggable__container',
                item: content(props)
            })
        });
    }
);

const content = hoistCmp.factory(
    ({icon, title, children}) => vframe({
        items: [
            dialogHeader({icon, title}),
            ...castArray(children)
        ]
    })
);


Dialog.propTypes = {
    /** An icon placed at the left-side of the dialog's header. */
    icon: PT.element,

    /** Title text added to the dialog's header. */
    title: PT.oneOfType([PT.string, PT.node])
};