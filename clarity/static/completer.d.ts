import { CommandRegistry } from '@phosphor/commands';
import { NotebookPanel } from '@jupyterlab/notebook';
import { Completer, CompletionHandler } from '@jupyterlab/completer';
import * as React from 'react';
export declare const CmdIds: {
    invoke: string;
    select: string;
    invokeNotebook: string;
    selectNotebook: string;
    save: string;
    download: string;
    interrupt: string;
    restart: string;
    switchKernel: string;
    runAndAdvance: string;
    restartAndRunAll: string;
    deleteCell: string;
    selectAbove: string;
    selectBelow: string;
    extendAbove: string;
    extendBelow: string;
    insertAbove: string;
    insertBelow: string;
    editMode: string;
    merge: string;
    split: string;
    commandMode: string;
    undo: string;
    redo: string;
};
export interface CompleterProps {
    notebookPanel: NotebookPanel;
    commands: CommandRegistry;
}
export declare class CompleterComponent extends React.Component<CompleterProps> {
    handler: CompletionHandler;
    completer: Completer;
    constructor(props: CompleterProps);
    componentDidMount(): void;
    render(): JSX.Element;
    addCommands: () => void;
}
