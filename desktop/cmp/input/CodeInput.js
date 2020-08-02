/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
import {form, FormModel} from '@xh/hoist/cmp/form';
import {HoistInput} from '@xh/hoist/cmp/input';
import {box, fragment, hbox} from '@xh/hoist/cmp/layout';
import {formField} from '@xh/hoist/desktop/cmp/form';
import {textInput} from '@xh/hoist/desktop/cmp/input/TextInput';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {elemFactory, HoistComponent, LayoutSupport, managed, XH} from '@xh/hoist/core';
import {button} from '@xh/hoist/desktop/cmp/button';
import {clipboardButton} from '@xh/hoist/desktop/cmp/clipboard';
import {Icon} from '@xh/hoist/icon';
import {dialog, textArea} from '@xh/hoist/kit/blueprint';
import {bindable} from '@xh/hoist/mobx';
import {withDefault} from '@xh/hoist/utils/js';
import * as codemirror from 'codemirror';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/scroll/simplescrollbars.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import {defaultsDeep, isFunction} from 'lodash';
import PT from 'prop-types';
import ReactDOM from 'react-dom';
import './CodeInput.scss';

/**
 * Code-editor style input, powered by CodeMirror. Displays a gutter with line numbers, mono-spaced
 * styling, and custom key handlers (e.g. tab to indent). Can be customized with options and
 * language modes supported by the underlying CodeMirror library {@link https://codemirror.net/}.
 *
 * Note Hoist also provides a preconfigured {@see JsonInput} component for editing JSON.
 *
 * TODO - understanding sizing spec / requirements for component vs. generated CodeMirror.
 * Reconcile LayoutSupport with width/height props. https://github.com/xh/hoist-react/issues/327
 */
@HoistComponent
@LayoutSupport
export class CodeInput extends HoistInput {

    /** @member {CodeMirror} - a CodeMirror editor instance. */
    editor;
    cursor;

    @bindable fullScreen = false;
    baseClassName = 'xh-code-input';

    @managed formModel = new FormModel({
        fields: [
            {name: 'query'}
        ]
    });

    static propTypes = {
        ...HoistInput.propTypes,

        /** True to focus the control on render. */
        autoFocus: PT.bool,

        /** True to commit on every change/keystroke, default false. */
        commitOnChange: PT.bool,

        /**
         * Configuration object with any properties supported by the CodeMirror API.
         * @see {@link https://codemirror.net/doc/manual.html#api_configuration|CodeMirror Docs}
         */
        editorProps: PT.object,

        /**
         * Callback to autoformat the code. Given the unformatted code, this should return a
         * properly-formatted copy.
         */
        formatter: PT.func,

        /** A CodeMirror linter to provide error detection and hinting in the gutter. */
        linter: PT.func,

        /**
         * A CodeMirror language mode - default none (plain-text).
         * See the CodeMirror docs ({@link https://codemirror.net/mode/}) regarding available modes.
         * Applications must import any mode they wish to enable.
         */
        mode: PT.string,

        /**
         * True to prevent user modification of editor contents, while still allowing user to
         * focus, select, and copy contents.
         */
        readonly: PT.bool,

        /** True to display a copy button at bottom-right of input. */
        showCopyButton: PT.bool,

        /**
         * True (default) to display autoformat button at bottom-right of input. Requires a
         * `formatter` to be configured and content to be editable (!readonly, !disabled).
         */
        showFormatButton: PT.bool,

        /** True (default) to display Fullscreen button at bottom-right of input. */
        showFullscreenButton: PT.bool,

        /** True to display search bar at bottom of input. */
        showToolbar: PT.bool
    };

    get commitOnChange() {return withDefault(this.props.commitOnChange, true)}
    get showCopyButton() {return withDefault(this.props.showCopyButton, false)}
    get showFullscreenButton() {return withDefault(this.props.showFullscreenButton, true)}
    get showToolbar() {return withDefault(this.props.showToolbar, false)}

    get showFormatButton() {
        const {disabled, readonly, formatter, showFormatButton} = this.props;
        return (
            !disabled &&
            !readonly &&
            isFunction(formatter) &&
            withDefault(showFormatButton, true)
        );
    }

    constructor(props, context) {
        super(props, context);

        this.addReaction({
            track: () => XH.darkTheme,
            run: () => {
                const {editor} = this;
                if (editor) editor.setOption('theme', XH.darkTheme ? 'dracula' : 'default');
            }
        });

        this.addReaction({
            track: () => this.renderValue,
            run: (value) => {
                const {editor} = this;
                if (editor && editor.getValue() != value) {
                    // CodeMirror will throw on null value.
                    editor.setValue(value == null ? '' : value);
                }
            }
        });

        this.addReaction({
            track: () => [this.props.readonly, this.props.disabled],
            run: (arr) => {
                const [readonly, disabled] = arr;
                this.editor.setOption('readOnly',  disabled || readonly);
            }
        });

        this.addReaction({
            track: () => this.query,
            run: (query) => {
                if (!this.editor) return;
                if (!query) {
                    this.editor.setCursor(0);
                    this.cursor = null;
                } else {
                    this.cursor = this.editor.getSearchCursor(query);
                }
            }
        });
    }

    render() {
        const {width, height, ...layoutProps} = this.getLayoutProps(),
            props = {
                ...layoutProps,
                width: withDefault(width, 300),
                height: withDefault(height, 100)
            };

        return this.fullScreen ? this.renderFullscreen(props) : this.renderInput(props);
    }

    renderFullscreen(props) {
        return fragment(
            dialog({
                className: 'xh-code-input--dialog',
                isOpen: true,
                canOutsideClickClose: true,
                item: this.renderInput({flex: 1}),
                onClose: () => this.setFullScreen(false)
            }),
            box({
                className: 'xh-code-input--placeholder',
                ...props
            })
        );
    }

    renderInput(props) {
        return box({
            items: [
                textArea({
                    value: this.renderValue || '',
                    ref: this.manageCodeEditor,
                    onChange: this.onChange
                }),
                this.renderActionButtons()
            ],

            className: this.getClassName(),
            onBlur: this.onBlur,
            onFocus: this.onFocus,

            ...props
        });
    }

    renderActionButtons() {
        const {showCopyButton, showFormatButton, showFullscreenButton, showToolbar} = this;

        if (!this.hasFocus || (!showCopyButton && !showFormatButton && !showFullscreenButton) || !showToolbar) {
            return null;
        }

        const {fullScreen, editor} = this;
        return hbox({
            className: 'xh-code-input__action-buttons',
            items: showToolbar ? toolbar({
                items: [
                    form({
                        model: this.formModel,
                        items: [
                            formField({
                                field: 'query',
                                label: null,
                                item: textInput({
                                    leftIcon: Icon.search(),
                                    width: 150,
                                    enableClear: true,
                                    onKeyDown: (e) => this.findNext(e)
                                })
                            }),
                            button({
                                icon: Icon.arrowUp(),
                                title: 'Find previous',
                                onClick: () => this.findPrevious()
                            }),
                            button({
                                icon: Icon.arrowDown(),
                                title: 'Find next',
                                onClick: () => this.findNext()
                            })
                        ]
                    }),
                    showCopyButton ? clipboardButton({
                        text: null,
                        title: 'Copy to clipboard',
                        successMessage: 'Contents copied to clipboard',
                        getCopyText: () => editor.getValue()
                    }) : null,
                    showFormatButton ? button({
                        icon: Icon.magic(),
                        title: 'Auto-format',
                        onClick: () => this.onAutoFormat()
                    }) : null,
                    showFullscreenButton ? button({
                        icon: fullScreen ? Icon.collapse() : Icon.expand(),
                        title: fullScreen ? 'Exit full screen' : 'Full screen',
                        onClick: () => this.setFullScreen(!fullScreen)
                    }) : null
                ]
            }) :
                [
                    showCopyButton ? clipboardButton({
                        text: null,
                        title: 'Copy to clipboard',
                        successMessage: 'Contents copied to clipboard',
                        getCopyText: () => editor.getValue()
                    }) : null,
                    showFormatButton ? button({
                        icon: Icon.magic(),
                        title: 'Auto-format',
                        onClick: () => this.onAutoFormat()
                    }) : null,
                    showFullscreenButton ? button({
                        icon: fullScreen ? Icon.collapse() : Icon.expand(),
                        title: fullScreen ? 'Exit full screen' : 'Full screen',
                        onClick: () => this.setFullScreen(!fullScreen)
                    }) : null
                ]
        });
    }

    //------------------
    // Implementation
    //------------------

    get query() {
        return this.formModel.values.query;
    }
    manageCodeEditor = (textAreaComp) => {
        if (textAreaComp) {
            this.editor = this.createCodeEditor(textAreaComp);
        }
    };

    createCodeEditor(textAreaComp) {
        const {editorProps, width, height} = this.props,
            editorSpec = defaultsDeep(
                editorProps,
                this.createDefaults()
            );

        const taDom = ReactDOM.findDOMNode(textAreaComp),
            editor = codemirror.fromTextArea(taDom, editorSpec);

        editor.on('change', this.handleEditorChange);

        if (width != null || height != null) {
            editor.setSize(width, height);
        }

        return editor;
    }

    createDefaults() {
        const {disabled, readonly, mode, linter, autoFocus, showToolbar} = this.props;
        let gutters = [
            'CodeMirror-linenumbers',
            'CodeMirror-foldgutter'
        ];
        if (linter) gutters.push('CodeMirror-lint-markers');

        return {
            mode: showToolbar ? 'text/html' : mode,
            theme: XH.darkTheme ? 'dracula' : 'default',
            lineWrapping: false,
            lineNumbers: true,
            autoCloseBrackets: true,
            extraKeys: {
                'Cmd-P': this.onAutoFormat,
                'Ctrl-P': this.onAutoFormat
            },
            foldGutter: true,
            scrollbarStyle: 'simple',
            readOnly: disabled || readonly,
            gutters,
            lint: linter ? {getAnnotations: linter} : false,
            autofocus: autoFocus
        };
    }

    onChange = (ev) => {
        this.noteValueChange(ev.target.value);
    };

    handleEditorChange = (editor) => {
        this.noteValueChange(editor.getValue());
    };

    onAutoFormat = () => {
        if (!isFunction(this.props.formatter)) return;

        const editor = this.editor,
            val = this.tryPrettyPrint(editor.getValue());
        editor.setValue(val);
    };

    tryPrettyPrint(str) {
        try {
            return this.props.formatter(str);
        } catch (e) {
            return str;
        }
    }

    findNext = (e) => {
        if (e && e.key !== 'Enter' || !this.cursor) return;

        const {editor, query, cursor} = this,
            found = cursor.findNext(query);

        if (found) {
            editor.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20);
            editor.setSelection(cursor.from(), cursor.to());
        }
    };

    findPrevious = () => {
        if (!this.cursor) return;

        const {editor, query, cursor} = this,
            found = cursor.findPrevious(query);

        if (found) {
            editor.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20);
            editor.setSelection(cursor.from(), cursor.to());
        }
    };

    destroy() {
        // Cleanup editor component as per CodeMirror docs.
        if (this.editor) this.editor.toTextArea();
    }
}
export const codeInput = elemFactory(CodeInput);
