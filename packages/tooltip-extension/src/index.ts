// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Kernel, KernelMessage } from '@jupyterlab/services';

import { JSONObject } from '@phosphor/coreutils';

import { Widget } from '@phosphor/widgets';

import { Text } from '@jupyterlab/coreutils';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { CodeEditor } from '@jupyterlab/codeeditor';

import { INotebookTracker } from '@jupyterlab/notebook';

import { ITooltipManager, Tooltip } from '@jupyterlab/tooltip';

/**
 * The command IDs used by the tooltip plugin.
 */
namespace CommandIDs {
  export const dismiss = 'tooltip:dismiss';

  export const launchNotebook = 'tooltip:launch-notebook';

  export const launchFile = 'tooltip:launch-file';
}

/**
 * The main tooltip manager plugin.
 */
const manager: JupyterFrontEndPlugin<ITooltipManager> = {
  id: '@jupyterlab/tooltip-extension:manager',
  autoStart: true,
  provides: ITooltipManager,
  activate: (app: JupyterFrontEnd): ITooltipManager => {
    let tooltip: Tooltip | null = null;

    // Add tooltip dismiss command.
    app.commands.addCommand(CommandIDs.dismiss, {
      execute: () => {
        if (tooltip) {
          tooltip.dispose();
          tooltip = null;
        }
      }
    });

    return {
      invoke(options: ITooltipManager.IOptions): Promise<void> {
        const detail: 0 | 1 = 0;
        const { anchor, editor, kernel, rendermime } = options;

        if (tooltip) {
          tooltip.dispose();
          tooltip = null;
        }

        return Private.fetch({ detail, editor, kernel })
          .then(bundle => {
            tooltip = new Tooltip({ anchor, bundle, editor, rendermime });
            Widget.attach(tooltip, document.body);
          })
          .catch(() => {
            /* Fails silently. */
          });
      }
    };
  }
};

/**
 * The notebook tooltip plugin.
 */
const notebooks: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/tooltip-extension:notebooks',
  autoStart: true,
  requires: [ITooltipManager, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    manager: ITooltipManager,
    notebooks: INotebookTracker
  ): void => {
    // Add tooltip launch command.
    app.commands.addCommand(CommandIDs.launchNotebook, {
      execute: () => {
        const parent = notebooks.currentWidget;

        if (!parent) {
          return;
        }

        const anchor = parent.content;
        const editor = anchor.activeCell.editor;
        const kernel = parent.session.kernel;
        const rendermime = anchor.rendermime;

        // If all components necessary for rendering exist, create a tooltip.
        if (!!editor && !!kernel && !!rendermime) {
          return manager.invoke({ anchor, editor, kernel, rendermime });
        }
      }
    });
  }
};

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  manager,
  notebooks
];
export default plugins;

/**
 * A namespace for private data.
 */
namespace Private {
  /**
   * A counter for outstanding requests.
   */
  let pending = 0;

  export interface IFetchOptions {
    /**
     * The detail level requested from the API.
     *
     * #### Notes
     * The only acceptable values are 0 and 1. The default value is 0.
     * @see http://jupyter-client.readthedocs.io/en/latest/messaging.html#introspection
     */
    detail?: 0 | 1;

    /**
     * The referent editor for the tooltip.
     */
    editor: CodeEditor.IEditor;

    /**
     * The kernel against which the API request will be made.
     */
    kernel: Kernel.IKernelConnection;
  }

  /**
   * Fetch a tooltip's content from the API server.
   */
  export function fetch(options: IFetchOptions): Promise<JSONObject> {
    let { detail, editor, kernel } = options;
    let code = editor.model.value.text;
    let position = editor.getCursorPosition();
    let offset = Text.jsIndexToCharIndex(editor.getOffsetAt(position), code);

    // Clear hints if the new text value is empty or kernel is unavailable.
    if (!code || !kernel) {
      return Promise.reject(void 0);
    }

    let contents: KernelMessage.IInspectRequestMsg['content'] = {
      code,
      cursor_pos: offset,
      detail_level: detail || 0
    };
    let current = ++pending;

    return kernel.requestInspect(contents).then(msg => {
      let value = msg.content;

      // If a newer request is pending, bail.
      if (current !== pending) {
        return Promise.reject(void 0) as Promise<JSONObject>;
      }

      // If request fails or returns negative results, bail.
      if (value.status !== 'ok' || !value.found) {
        return Promise.reject(void 0) as Promise<JSONObject>;
      }

      return Promise.resolve(value.data);
    });
  }
}
