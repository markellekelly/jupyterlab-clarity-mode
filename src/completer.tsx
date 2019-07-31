import { CommandRegistry } from '@phosphor/commands';
import { Widget } from '@phosphor/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  CompleterModel,
  Completer,
  CompletionHandler,
  KernelConnector
} from '@jupyterlab/completer';
import * as React from 'react';

export const CmdIds = {
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

export interface CompleterProps {
  notebookPanel: NotebookPanel;
  commands: CommandRegistry;
}

export class CompleterComponent extends React.Component<CompleterProps> {
  handler: CompletionHandler;
  completer: Completer;

  constructor(props: CompleterProps) {
    super(props);

    const editor =
      this.props.notebookPanel.content.activeCell &&
      this.props.notebookPanel.content.activeCell.editor;
    const model = new CompleterModel();
    this.completer = new Completer({ editor, model });
    const connector = new KernelConnector({
      session: this.props.notebookPanel.session
    });
    this.handler = new CompletionHandler({
      completer: this.completer,
      connector
    });
    // Set the handler's editor.
    this.handler.editor = editor;

    // Listen for active cell changes.
    this.props.notebookPanel.content.activeCellChanged.connect(
      (sender:any, cell:any) => {
        this.handler.editor = cell && cell.editor;
      }
    );

    // Hide the widget when it first loads.
    this.completer.hide();

    this.addCommands();
  }

  componentDidMount() {
    Widget.attach(this.completer, document.body);
  };

  render() {
    return <div />;
  };

  addCommands = () => {
    this.props.commands.addCommand(CmdIds.invoke, {
      label: 'Completer: Invoke',
      execute: () => this.handler.invoke()
    });
    this.props.commands.addCommand(CmdIds.select, {
      label: 'Completer: Select',
      execute: () => this.handler.completer.selectActive()
    });
  };
}