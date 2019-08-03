// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ISettingRegistry } from '@jupyterlab/coreutils';

import { IMainMenu } from '@jupyterlab/mainmenu';

/**
 * IDs of the commands added by this extension.
 */
namespace CommandIDs {
  export const toggle = 'extensionmanager:toggle';
}

/**
 * The extension manager plugin.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/extensionmanager-extension:plugin',
  autoStart: true,
  requires: [ISettingRegistry],
  optional: [ILabShell, ILayoutRestorer, IMainMenu, ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    registry: ISettingRegistry,
    labShell: ILabShell | null,
    restorer: ILayoutRestorer | null,
    mainMenu: IMainMenu | null,
    palette: ICommandPalette | null
  ) => {
    const settings = await registry.load(plugin.id);
    let enabled = settings.composite['enabled'] === true;

    const { commands, serviceManager } = app;


    commands.addCommand(CommandIDs.toggle, {
      label: 'Enable Extension Manager (experimental)',
      execute: () => {
        if (registry) {
          void registry.set(plugin.id, 'enabled', !enabled);
        }
      },
      isToggled: () => enabled,
      isEnabled: () => serviceManager.builder.isAvailable
    });

    const category = 'Extension Manager';
    const command = CommandIDs.toggle;
    if (palette) {
      palette.addItem({ command, category });
    }

    if (mainMenu) {
      mainMenu.settingsMenu.addGroup([{ command }], 100);
    }
  }
};

/**
 * Export the plugin as the default.
 */
export default plugin;
