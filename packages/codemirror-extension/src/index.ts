// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import CodeMirror from 'codemirror';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IEditorServices } from '@jupyterlab/codeeditor';

import {
  editorServices
} from '@jupyterlab/codemirror';


/**
 * The editor services.
 */
const services: JupyterFrontEndPlugin<IEditorServices> = {
  id: '@jupyterlab/codemirror-extension:services',
  provides: IEditorServices,
  activate: activateEditorServices
};


/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  services
];
export default plugins;

/**
 * Set up the editor services.
 */
function activateEditorServices(app: JupyterFrontEnd): IEditorServices {
  CodeMirror.prototype.save = () => {
    void app.commands.execute('docmanager:save');
  };
  return editorServices;
}

