import * as React from 'react';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@phosphor/commands';
import { Contents } from '@jupyterlab/services';
export interface INotebookProps {
    notebookWidget: NotebookPanel;
    commands: CommandRegistry;
    notebookPath: string;
    id: string;
    className?: string;
    contentsManager: Contents.IManager;
}
export interface INotebookState {
    containerElement: HTMLElement;
}
/**
 * Wraps a NotebookPanel with a dummy <div>
 */
export declare class NotebookComponent extends React.Component<INotebookProps, INotebookState> {
    constructor(props: INotebookProps);
    componentDidMount(): void;
    setupToolbarItems: () => void;
    render(): JSX.Element;
    addCommands: () => void;
    addShortcuts: () => void;
}
