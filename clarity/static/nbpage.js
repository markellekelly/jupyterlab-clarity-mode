"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("@phosphor/commands");
const coreutils_1 = require("@jupyterlab/coreutils");
const notebook_1 = require("@jupyterlab/notebook");
const codemirror_1 = require("@jupyterlab/codemirror");
const docmanager_1 = require("@jupyterlab/docmanager");
const docregistry_1 = require("@jupyterlab/docregistry");
const nbcomponent_1 = require("./nbcomponent");
const completer_1 = require("./completer");
const React = __importStar(require("react"));
/**
 * Notebook application component
 */
class NotebookPage extends React.Component {
    constructor(props) {
        super(props);
        this.addCommands = () => {
            let commands = this.commands;
            commands.addCommand('switch:lab', {
                label: 'Open in JupyterLab',
                execute: () => {
                    const labUrl = coreutils_1.PageConfig.getBaseUrl() + 'lab/tree/' + this.props.notebookPath;
                    window.location.href = labUrl;
                }
            });
            commands.addCommand('switch:classic', {
                label: 'Open in Classic Jupyter',
                execute: () => {
                    const classicUrl = coreutils_1.PageConfig.getBaseUrl() + 'tree/' + this.props.notebookPath;
                    window.location.href = classicUrl;
                }
            });
            return commands;
        };
        this.commandOrder = ['notebook:download', '-', 'switch:lab', 'switch:classic'];
        // Initialize the command registry with the bindings.
        this.commands = new commands_1.CommandRegistry();
        let useCapture = true;
        // Setup the keydown listener for the document.
        document.addEventListener('keydown', event => {
            this.commands.processKeydownEvent(event);
        }, useCapture);
        let opener = {
            open: (widget) => {
                // Do nothing for sibling widgets for now.
            }
        };
        let docRegistry = new docregistry_1.DocumentRegistry();
        let docManager = new docmanager_1.DocumentManager({
            registry: docRegistry,
            manager: this.props.serviceManager,
            opener
        });
        let mFactory = new notebook_1.NotebookModelFactory({});
        let editorFactory = codemirror_1.editorServices.factoryService.newInlineEditor;
        let contentFactory = new notebook_1.NotebookPanel.ContentFactory({ editorFactory });
        let wFactory = new notebook_1.NotebookWidgetFactory({
            name: 'Notebook',
            modelName: 'notebook',
            fileTypes: ['notebook'],
            defaultFor: ['notebook'],
            preferKernel: true,
            canStartKernel: true,
            rendermime: this.props.rendermime,
            contentFactory,
            mimeTypeService: codemirror_1.editorServices.mimeTypeService
        });
        docRegistry.addModelFactory(mFactory);
        docRegistry.addWidgetFactory(wFactory);
        this.nbWidget = docManager.open(this.props.notebookPath);
        this.addCommands();
    }
    render() {
        // FIXME: Better way of getting rid of extension?
        const notebookName = coreutils_1.PathExt.basename(this.props.notebookPath).replace('.ipynb', '');
        return [
            React.createElement(Header, { title: notebookName, key: "page-header" }),
            React.createElement("main", { key: "main" },
                React.createElement(nbcomponent_1.NotebookComponent, { id: "main-container", commands: this.commands, notebookWidget: this.nbWidget, notebookPath: this.props.notebookPath, contentsManager: this.props.serviceManager.contents })),
            React.createElement(completer_1.CompleterComponent, { key: "completer", commands: this.commands, notebookPanel: this.nbWidget })
        ];
    }
}
exports.NotebookPage = NotebookPage;
let Header = (props) => {
    return (React.createElement("header", { className: "sn-header" },
        React.createElement("div", { className: "sn-header-title" }, props.title)));
};
