// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Menu, Widget } from '@phosphor/widgets';

import { IJupyterLabMenu, IMenuExtender, JupyterLabMenu } from './labmenu';

/**
 * An interface for a File menu.
 */
export interface IFileMenu extends IJupyterLabMenu {
  /**
   * Option to add a `Quit` entry in the File menu
   */
  quitEntry: boolean;

  /**
   * A submenu for creating new files/launching new activities.
   */
  readonly newMenu: IJupyterLabMenu;

  /**
   * The close and cleanup extension point.
   */
  readonly closeAndCleaners: Set<IFileMenu.ICloseAndCleaner<Widget>>;
}

/**
 * An extensible FileMenu for the application.
 */
export class FileMenu extends JupyterLabMenu implements IFileMenu {
  constructor(options: Menu.IOptions) {
    super(options);

    this.menu.title.label = 'File';

    this.quitEntry = false;

    // Create the "New" submenu.
    this.newMenu = new JupyterLabMenu(options, false);
    this.newMenu.menu.title.label = 'New';
    this.closeAndCleaners = new Set<IFileMenu.ICloseAndCleaner<Widget>>();
  }

  /**
   * The New submenu.
   */
  readonly newMenu: JupyterLabMenu;

  /**
   * The close and cleanup extension point.
   */
  readonly closeAndCleaners: Set<IFileMenu.ICloseAndCleaner<Widget>>;

  /**
   * Dispose of the resources held by the file menu.
   */
  dispose(): void {
    this.newMenu.dispose();
    super.dispose();
  }

  /**
   * Option to add a `Quit` entry in File menu
   */
  public quitEntry: boolean;
}

/**
 * Namespace for IFileMenu
 */
export namespace IFileMenu {
  /**
   * Interface for an activity that has some cleanup action associated
   * with it in addition to merely closing its widget in the main area.
   */
  export interface ICloseAndCleaner<T extends Widget> extends IMenuExtender<T> {
    /**
     * A label to use for the activity that is being cleaned up.
     */
    name: string;

    /**
     * A label to use for the cleanup action.
     */
    action: string;

    /**
     * A function to perform the close and cleanup action.
     */
    closeAndCleanup: (widget: T) => Promise<void>;
  }
}
