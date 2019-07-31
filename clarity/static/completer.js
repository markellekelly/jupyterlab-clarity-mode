"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const completer_1 = require("@jupyterlab/completer");
const React = __importStar(require("react"));
exports.CmdIds = {
    invoke: 'completer:invoke',
    select: 'completer:select',
    invokeNotebook: 'completer:invoke-notebook',
    selectNotebook: 'completer:select-notebook',
    save: 'notebook:save',
    download: 'notebook:download',
    interrupt: 'notebook:interrupt-kernel',
    restart: 'notebook:restart-kernel',
    switchKernel: 'notebook:switch-kernel',
    runAndAdvance: 'notebook-cells:run-and-advance',
    restartAndRunAll: 'notebook:restart-and-run-all',
    deleteCell: 'notebook-cells:delete',
    selectAbove: 'notebook-cells:select-above',
    selectBelow: 'notebook-cells:select-below',
    extendAbove: 'notebook-cells:extend-above',
    extendBelow: 'notebook-cells:extend-below',
    insertAbove: 'notebook-cells:insert-above',
    insertBelow: 'notebook-cells:insert-below',
    editMode: 'notebook:edit-mode',
    merge: 'notebook-cells:merge',
    split: 'notebook-cells:split',
    commandMode: 'notebook:command-mode',
    undo: 'notebook-cells:undo',
    redo: 'notebook-cells:redo'
};
class CompleterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.addCommands = () => {
            this.props.commands.addCommand(exports.CmdIds.invoke, {
                label: 'Completer: Invoke',
                execute: () => this.handler.invoke()
            });
            this.props.commands.addCommand(exports.CmdIds.select, {
                label: 'Completer: Select',
                execute: () => this.handler.completer.selectActive()
            });
        };
        const editor = this.props.notebookPanel.content.activeCell &&
            this.props.notebookPanel.content.activeCell.editor;
        const model = new completer_1.CompleterModel();
        this.completer = new completer_1.Completer({ editor, model });
        const connector = new completer_1.KernelConnector({
            session: this.props.notebookPanel.session
        });
        this.handler = new completer_1.CompletionHandler({
            completer: this.completer,
            connector
        });
        // Set the handler's editor.
        this.handler.editor = editor;
        // Listen for active cell changes.
        this.props.notebookPanel.content.activeCellChanged.connect((sender, cell) => {
            this.handler.editor = cell && cell.editor;
        });
        // Hide the widget when it first loads.
        this.completer.hide();
        this.addCommands();
    }
    componentDidMount() {
        widgets_1.Widget.attach(this.completer, document.body);
    }
    ;
    render() {
        return React.createElement("div", null);
    }
    ;
}
exports.CompleterComponent = CompleterComponent;
