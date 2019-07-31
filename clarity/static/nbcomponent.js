"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const widgets_1 = require("@phosphor/widgets");
const notebook_1 = require("@jupyterlab/notebook");
const completer_1 = require("./completer");
const apputils_1 = require("@jupyterlab/apputils");
const ui_components_1 = require("@jupyterlab/ui-components");
class InterfaceSwitcher extends apputils_1.ReactWidget {
    constructor(commands) {
        super();
        this.commands = commands;
        this.addClass('jp-Notebook-toolbarCellType');
    }
    onChange(event) {
        let target = event.target.value;
        if (target === '-') {
            return;
        }
        this.commands.execute('switch:' + target);
    }
    ;
    render() {
        return (React.createElement(ui_components_1.HTMLSelect, { minimal: true, onChange: this.onChange, className: "jp-Notebook-toolbarCellTypeDropdown" },
            React.createElement("option", { value: "-" }, "Interface"),
            React.createElement("option", { value: "lab" }, "JupyterLab"),
            React.createElement("option", { value: "classic" }, "Classic")));
    }
    ;
}
/**
 * Wraps a NotebookPanel with a dummy <div>
 */
class NotebookComponent extends React.Component {
    constructor(props) {
        super(props);
        this.setupToolbarItems = () => {
            const toolbar = this.props.notebookWidget.toolbar;
            const downloadToolBarButton = new apputils_1.ToolbarButton({
                onClick: () => this.props.commands.execute(completer_1.CmdIds.download),
                tooltip: 'Download notebook to your computer',
                iconClassName: 'jp-MaterialIcon jp-DownloadIcon',
                iconLabel: 'Download notebook'
            });
            const restartAndRunAll = new apputils_1.ToolbarButton({
                iconClassName: 'jp-MaterialIcon sn-RestartAndRunAllIcon',
                iconLabel: 'Restart Kernel & Run All Cells',
                tooltip: 'Restart Kernel & Run All Cells',
                onClick: () => this.props.commands.execute(completer_1.CmdIds.restartAndRunAll)
            });
            // We insert toolbar items right to left.
            // This way, we can calculate indexes by counting in the default jupyterlab toolbar,
            // and our own toolbar items won't affect our insertion order.j
            // FIXME: Determine dynamically once https://github.com/jupyterlab/jupyterlab/issues/5894 lands
            toolbar.insertItem(
            // Just before the kernel switcher
            10, 'switch-notebook', new InterfaceSwitcher(this.props.commands));
            toolbar.insertItem(
            // Just after restart kernel
            8, 'restartAndRunAll', restartAndRunAll);
            toolbar.insertItem(
            // Just after the save button.
            // FIXME: Determine dynamically once https://github.com/jupyterlab/jupyterlab/issues/5894 lands
            1, 'download-notebook', downloadToolBarButton);
        };
        this.addCommands = () => {
            const commands = this.props.commands;
            const nbWidget = this.props.notebookWidget;
            // Add commands.
            commands.addCommand(completer_1.CmdIds.invokeNotebook, {
                label: 'Invoke Notebook',
                execute: () => {
                    if (nbWidget.content.activeCell.model.type === 'code') {
                        return commands.execute(completer_1.CmdIds.invoke);
                    }
                }
            });
            commands.addCommand(completer_1.CmdIds.selectNotebook, {
                label: 'Select Notebook',
                execute: () => {
                    if (nbWidget.content.activeCell.model.type === 'code') {
                        return commands.execute(completer_1.CmdIds.select);
                    }
                }
            });
            commands.addCommand(completer_1.CmdIds.save, {
                label: 'Save',
                execute: () => nbWidget.context.save()
            });
            commands.addCommand(completer_1.CmdIds.interrupt, {
                label: 'Interrupt',
                execute: () => {
                    if (nbWidget.context.session.kernel) {
                        nbWidget.context.session.kernel.interrupt();
                    }
                }
            });
            commands.addCommand(completer_1.CmdIds.restart, {
                label: 'Restart Kernel',
                execute: () => nbWidget.context.session.restart()
            });
            commands.addCommand(completer_1.CmdIds.switchKernel, {
                label: 'Switch Kernel',
                execute: () => nbWidget.context.session.selectKernel()
            });
            commands.addCommand(completer_1.CmdIds.runAndAdvance, {
                label: 'Run and Advance',
                execute: () => {
                    notebook_1.NotebookActions.runAndAdvance(nbWidget.content, nbWidget.context.session);
                }
            });
            commands.addCommand(completer_1.CmdIds.restartAndRunAll, {
                label: 'Restart Kernel & Run All Cells',
                execute: () => {
                    nbWidget.context.session.restart().then(() => {
                        notebook_1.NotebookActions.runAll(nbWidget.content, nbWidget.context.session);
                    });
                }
            });
            commands.addCommand(completer_1.CmdIds.editMode, {
                label: 'Edit Mode',
                execute: () => {
                    nbWidget.content.mode = 'edit';
                }
            });
            commands.addCommand(completer_1.CmdIds.commandMode, {
                label: 'Command Mode',
                execute: () => {
                    nbWidget.content.mode = 'command';
                }
            });
            commands.addCommand(completer_1.CmdIds.selectBelow, {
                label: 'Select Below',
                execute: () => notebook_1.NotebookActions.selectBelow(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.selectAbove, {
                label: 'Select Above',
                execute: () => notebook_1.NotebookActions.selectAbove(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.extendAbove, {
                label: 'Extend Above',
                execute: () => notebook_1.NotebookActions.extendSelectionAbove(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.extendBelow, {
                label: 'Extend Below',
                execute: () => notebook_1.NotebookActions.extendSelectionBelow(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.insertAbove, {
                label: 'Insert Above',
                execute: () => notebook_1.NotebookActions.insertAbove(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.insertBelow, {
                label: 'Insert Below',
                execute: () => notebook_1.NotebookActions.insertBelow(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.split, {
                label: 'Split Cell',
                execute: () => notebook_1.NotebookActions.splitCell(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.undo, {
                label: 'Undo',
                execute: () => notebook_1.NotebookActions.undo(nbWidget.content)
            });
            commands.addCommand(completer_1.CmdIds.redo, {
                label: 'Redo',
                execute: () => notebook_1.NotebookActions.redo(nbWidget.content)
            });
            commands.addCommand('notebook:download', {
                label: 'Download Notebook',
                execute: () => {
                    this.props.contentsManager
                        .getDownloadUrl(this.props.notebookPath)
                        .then(url => {
                        window.open(url, '_blank');
                    });
                }
            });
        };
        this.addShortcuts = () => {
            const completerActive = '.jp-mod-completer-active';
            const editModeWithCompleter = '.jp-Notebook.jp-mod-editMode .jp-mod-completer-enabled';
            const all = '.jp-Notebook';
            const commandMode = '.jp-Notebook.jp-mod-commandMode:focus';
            const editMode = '.jp-Notebook.jp-mod-editMode';
            let bindings = [
                // Tab / code completor shortcuts
                {
                    selector: editModeWithCompleter,
                    keys: ['Tab'],
                    command: completer_1.CmdIds.invokeNotebook
                },
                {
                    selector: completerActive,
                    keys: ['Enter'],
                    command: completer_1.CmdIds.selectNotebook
                },
                // General shortcut available at all times
                { selector: all, keys: ['Shift Enter'], command: completer_1.CmdIds.runAndAdvance },
                { selector: all, keys: ['Accel S'], command: completer_1.CmdIds.save }
            ];
            const editModeShortcuts = [
                // Shortcuts available in edit mode
                { keys: ['Ctrl Shift -'], command: completer_1.CmdIds.split },
                { keys: ['Escape'], command: completer_1.CmdIds.commandMode }
            ];
            const commandModeShortcuts = [
                // Kernel related shortcuts
                { keys: ['I', 'I'], command: completer_1.CmdIds.interrupt },
                { keys: ['0', '0'], command: completer_1.CmdIds.restart },
                // Cell operation shortcuts
                { keys: ['Enter'], command: completer_1.CmdIds.editMode },
                { keys: ['Shift M'], command: completer_1.CmdIds.merge },
                { keys: ['Shift K'], command: completer_1.CmdIds.extendAbove },
                { keys: ['Shift J'], command: completer_1.CmdIds.extendBelow },
                { keys: ['A'], command: completer_1.CmdIds.insertAbove },
                { keys: ['B'], command: completer_1.CmdIds.insertBelow },
                { keys: ['R', 'R'], command: completer_1.CmdIds.restartAndRunAll },
                // Cell movement shortcuts
                { keys: ['J'], command: completer_1.CmdIds.selectBelow },
                { keys: ['ArrowDown'], command: completer_1.CmdIds.selectBelow },
                { keys: ['K'], command: completer_1.CmdIds.selectAbove },
                { keys: ['ArrowUp'], command: completer_1.CmdIds.selectAbove },
                // Other shortcuts
                { keys: ['Z'], command: completer_1.CmdIds.undo },
                { keys: ['Y'], command: completer_1.CmdIds.redo }
            ];
            commandModeShortcuts.map(binding => this.props.commands.addKeyBinding(Object.assign({ selector: commandMode }, binding)));
            editModeShortcuts.map(binding => this.props.commands.addKeyBinding(Object.assign({ selector: editMode }, binding)));
            bindings.map(binding => this.props.commands.addKeyBinding(binding));
        };
        this.addCommands();
        this.addShortcuts();
    }
    componentDidMount() {
        widgets_1.Widget.attach(this.props.notebookWidget, document.getElementById(this.props.id));
        // Handle resize events.
        window.addEventListener('resize', () => {
            this.props.notebookWidget.update();
        });
        this.setupToolbarItems();
    }
    render() {
        let className = 'notebook-super-container ';
        if (this.props.className !== undefined) {
            className += this.props.className;
        }
        return React.createElement("div", { className: className, id: this.props.id });
    }
}
exports.NotebookComponent = NotebookComponent;
