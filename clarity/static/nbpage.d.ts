import { CommandRegistry } from '@phosphor/commands';
import { ServiceManager } from '@jupyterlab/services';
import { NotebookPanel } from '@jupyterlab/notebook';
import { Completer, CompletionHandler } from '@jupyterlab/completer';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import * as React from 'react';
export interface NotebookPageProps {
    serviceManager: ServiceManager.IManager;
    notebookPath: string;
    rendermime: RenderMimeRegistry;
}
/**
 * Notebook application component
 */
export declare class NotebookPage extends React.Component<NotebookPageProps> {
    commands: CommandRegistry;
    nbWidget: NotebookPanel;
    completer: Completer;
    completionHandler: CompletionHandler;
    constructor(props: NotebookPageProps);
    addCommands: () => CommandRegistry;
    commandOrder: string[];
    render(): JSX.Element[];
}
