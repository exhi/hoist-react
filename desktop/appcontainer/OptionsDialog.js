/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2019 Extremely Heavy Industries Inc.
 */
import {dialog, dialogBody} from '@xh/hoist/kit/blueprint';
import {hoistCmpFactory, XH, uses} from '@xh/hoist/core';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {Icon} from '@xh/hoist/icon';
import {filler} from '@xh/hoist/cmp/layout';
import {button, restoreDefaultsButton} from '@xh/hoist/desktop/cmp/button';
import {form} from '@xh/hoist/cmp/form';
import {formField} from '@xh/hoist/desktop/cmp/form';
import {hotkeysHost} from '@xh/hoist/desktop/cmp/hotkeys';
import {OptionsDialogModel} from '@xh/hoist/appcontainer/OptionsDialogModel';
import './OptionsDialog.scss';

/**
 * Dialog to provide a built-in editor for app-wide user preferences, as specified by
 * the `HoistAppModel.getAppOptions()` template method.
 *
 * @private
 */
export const optionsDialog = hoistCmpFactory({
    displayName: 'OptionsDialog',
    model: uses(OptionsDialogModel),
    className: 'xh-options-dialog',

    render({model, className}) {
        if (!model.hasOptions) return null;
        return hotkeysHost({
            hotkeys: [{
                global: true,
                combo: 'shift + o',
                label: 'Open Options Dialog',
                onKeyDown: () => model.show()
            }],
            item: model.isOpen ? displayedDialog({className}) : null
        });
    }
});

const displayedDialog = hoistCmpFactory({
    render({model, className}) {
        const {reloadRequired, formModel} = model;

        return dialog({
            title: `${XH.clientAppName} Options`,
            icon: Icon.options(),
            className,
            isOpen: true,
            onClose: () => model.hide(),
            canOutsideClickClose: false,
            item: [
                panel({
                    mask: model.loadModel,
                    item: dialogBody(
                        form({
                            model: formModel,
                            fieldDefaults: {minimal: true, inline: true},
                            items: model.options.map(option => {
                                return formField({field: option.name, ...option.formField});
                            })
                        })
                    ),
                    bbar: [
                        restoreDefaultsButton(),
                        filler(),
                        button({
                            text: 'Cancel',
                            onClick: () => model.hide()
                        }),
                        button({
                            disabled: !formModel.isDirty,
                            text: reloadRequired ? 'Save & Reload' : 'Save',
                            icon: reloadRequired ? Icon.refresh() : Icon.check(),
                            intent: 'success',
                            onClick: () => model.saveAsync()
                        })
                    ]
                })
            ]
        });
    }
});
