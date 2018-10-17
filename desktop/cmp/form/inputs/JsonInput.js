import ReactDOM from 'react-dom';
import {XH, elemFactory, HoistComponent, LayoutSupport} from '@xh/hoist/core';
import PT from 'prop-types';
import {defaultsDeep} from 'lodash';
import {box} from '@xh/hoist/cmp/layout';
import {textArea} from '@xh/hoist/kit/blueprint';
import {withDefault} from '@xh/hoist/utils/js';

import {HoistInput} from '@xh/hoist/cmp/form';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/dracula.css';

import * as codemirror from 'codemirror';
import {jsonlint} from '../impl/jsonlint';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/scroll/simplescrollbars.js';
import 'codemirror/addon/lint/lint.js';

import './JsonInput.scss';

/**
 * Code-editor style input for editing and validating JSON, powered by CodeMirror.
 *
 * TODO - understanding sizing spec / requirements for component vs. generated CodeMirror.
 * Reconcile LayoutSupport with width/height props. https://github.com/exhi/hoist-react/issues/327
 */
@HoistComponent
@LayoutSupport
export class JsonInput extends HoistInput {

    static propTypes = {
        ...HoistInput.propTypes,
        value: PT.string,

        /** True to commit on every change/keystroke, default false. */
        commitOnChange: PT.bool,

        /**
         * Configuration object with any properties supported by the CodeMirror API.
         * @see {@link https://codemirror.net/doc/manual.html#api_configuration|CodeMirror Docs}
         */
        editorProps: PT.object,

        /** Height of the embedded editor in pixels. */
        height: PT.number,

        /** Width of the embedded editor in pixels. */
        width: PT.number
    };

    get commitOnChange() {
        withDefault(this.props.commitOnChange, false);
    }

    constructor(props) {
        super(props);
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
                    editor.setValue(value);
                }
            }
        });
    }

    editor = null;
    taCmp = null;

    baseClassName = 'xh-json-input';

    render() {
        return box({
            item: textArea({
                value: this.renderValue || '',
                ref: this.manageJsonEditor,
                onChange: this.onChange
            }),

            className: this.getClassName(),
            flex: 1,
            flexDirection: 'column',
            ...this.getLayoutProps(),

            onBlur: this.onBlur,
            onFocus:  this.onFocus
        });
    }

    //------------------
    // Implementation
    //------------------
    manageJsonEditor = (taCmp) => {
        if (taCmp) {
            this.taCmp = taCmp;
            this.editor = this.createJsonEditor(taCmp);
        }
    }

    createJsonEditor(taCmp) {
        const {editorProps, width, height} = this.props,
            editorSpec = defaultsDeep(
                editorProps,
                this.createDefaults()
            );

        const taDom = ReactDOM.findDOMNode(taCmp),
            editor = codemirror.fromTextArea(taDom, editorSpec);

        editor.on('change', this.handleEditorChange);

        if (width != null || height != null) {
            editor.setSize(width, height);
        }

        return editor;
    }

    createDefaults() {
        const {disabled} = this.props;
        return {
            mode: 'application/json',
            theme: XH.darkTheme ? 'dracula' : 'default',
            lineWrapping: false,
            lineNumbers: true,
            autoCloseBrackets: true,
            extraKeys: {
                'Cmd-P': this.onFormatKey,
                'Ctrl-P': this.onFormatKey
            },
            foldGutter: true,
            scrollbarStyle: 'simple',
            readOnly: disabled,
            gutters: [
                'CodeMirror-linenumbers',
                'CodeMirror-foldgutter'
            ],
            lint: true
        };
    }

    onChange = (ev) => {
        this.noteValueChange(ev.target.value);
    };

    handleEditorChange = (editor) => {
        this.noteValueChange(editor.getValue());
    };

    onFormatKey = () => {
        const editor = this.editor,
            val = this.tryPrettyPrint(editor.getValue());

        editor.setValue(val);
    };

    tryPrettyPrint(str) {
        try {
            return JSON.stringify(JSON.parse(str), undefined, 2);
        } catch (e) {
            return str;
        }
    }

    destroy() {
        // Cleanup editor component as per CodeMirror docs.
        if (this.editor) this.editor.toTextArea();
    }
}
export const jsonInput = elemFactory(JsonInput);


/**
 * See https://codemirror.net/demo/lint.html for demo implementation of linting support.
 *
 * The below is adapted from /addon/lint/json-lint.js, modified to work with the jsonlint-mod-fix
 * library (which is a fork of jsonlint, modified to work with modules).
 */
codemirror.registerHelper('lint', 'json', function(text) {
    const found = [];

    jsonlint.parseError = function(str, hash) {
        const loc = hash.loc;
        found.push({
            from: codemirror.Pos(loc.first_line - 1, loc.first_column),
            to: codemirror.Pos(loc.last_line - 1, loc.last_column),
            message: str
        });
    };

    if (!text) return found;

    try {
        jsonlint.parse(text);
    } catch (ignored) {}

    return found;
});