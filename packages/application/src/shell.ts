// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Debouncer } from '@jupyterlab/coreutils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { find, IIterator, toArray } from '@phosphor/algorithm';

import { PromiseDelegate, Token } from '@phosphor/coreutils';

import { Message, MessageLoop, IMessageHandler } from '@phosphor/messaging';

import { ISignal, Signal } from '@phosphor/signaling';

import {
  BoxLayout,
  BoxPanel,
  DockLayout,
  DockPanel,
  FocusTracker,
  Panel,
  SplitPanel,
  TabBar,
  Widget
} from '@phosphor/widgets';

import { JupyterFrontEnd } from './frontend';

/**
 * The class name added to AppShell instances.
 */
const APPLICATION_SHELL_CLASS = 'jp-LabShell';

/**
 * The class name added to the current widget's title.
 */
const CURRENT_CLASS = 'jp-mod-current';

/**
 * The class name added to the active widget's title.
 */
const ACTIVE_CLASS = 'jp-mod-active';

const ACTIVITY_CLASS = 'jp-Activity';

/* tslint:disable */
/**
 * The JupyterLab application shell token.
 */
export const ILabShell = new Token<ILabShell>(
  '@jupyterlab/application:ILabShell'
);
/* tslint:enable */

/**
 * The JupyterLab application shell interface.
 */
export interface ILabShell extends LabShell {}

/**
 * The namespace for `ILabShell` type information.
 */
export namespace ILabShell {
  /**
   * The areas of the application shell where widgets can reside.
   */
  export type Area = 'main' | 'header' | 'top';

  /**
   * The restorable description of an area within the main dock panel.
   */
  export type AreaConfig = DockLayout.AreaConfig;

  /**
   * An arguments object for the changed signals.
   */
  export type IChangedArgs = FocusTracker.IChangedArgs<Widget>;

  /**
   * A description of the application's user interface layout.
   */
  export interface ILayout {
    /**
     * Indicates whether fetched session restore data was actually retrieved
     * from the state database or whether it is a fresh blank slate.
     *
     * #### Notes
     * This attribute is only relevant when the layout data is retrieved via a
     * `fetch` call. If it is set when being passed into `save`, it will be
     * ignored.
     */
    readonly fresh?: boolean;

    /**
     * The main area of the user interface.
     */
    readonly mainArea: IMainArea | null;
  }

  /**
   * The restorable description of the main application area.
   */
  export interface IMainArea {
    /**
     * The current widget that has application focus.
     */
    readonly currentWidget: Widget | null;

    /**
     * The contents of the main application dock panel.
     */
    readonly dock: DockLayout.ILayoutConfig | null;

    /**
     * The document mode (i.e., multiple/single) of the main dock panel.
     */
    readonly mode: DockPanel.Mode | null;
  }
}

/**
 * The application shell for JupyterLab.
 */
export class LabShell extends Widget implements JupyterFrontEnd.IShell {
  /**
   * Construct a new application shell.
   */
  constructor() {
    super();
    this.addClass(APPLICATION_SHELL_CLASS);
    this.id = 'main';

    let topPanel = (this._topPanel = new Panel());
    let hboxPanel = new BoxPanel();
    let dockPanel = (this._dockPanel = new DockPanel());
    let headerPanel = (this._headerPanel = new Panel());
    MessageLoop.installMessageHook(dockPanel, this._dockChildHook);

    let hsplitPanel = new SplitPanel();
    let rootLayout = new BoxLayout();

    topPanel.id = 'jp-top-panel';
    hboxPanel.id = 'jp-main-content-panel';
    dockPanel.id = 'jp-main-dock-panel';
    hsplitPanel.id = 'jp-main-split-panel';
    headerPanel.id = 'jp-header-panel';

    hboxPanel.spacing = 0;
    dockPanel.spacing = 5;
    hsplitPanel.spacing = 1;

    hboxPanel.direction = 'left-to-right';
    hsplitPanel.orientation = 'horizontal';

    SplitPanel.setStretch(dockPanel, 1);

    BoxPanel.setStretch(hsplitPanel, 1);

    hsplitPanel.addWidget(dockPanel);

    hboxPanel.addWidget(hsplitPanel);

    rootLayout.direction = 'top-to-bottom';
    rootLayout.spacing = 0; // TODO make this configurable?
    // Use relative sizing to set the width of the side panels.
    // This will still respect the min-size of children widget in the stacked
    // panel.
    hsplitPanel.setRelativeSizes([1, 2.5, 1]);

    BoxLayout.setStretch(headerPanel, 0);
    BoxLayout.setStretch(topPanel, 0);
    BoxLayout.setStretch(hboxPanel, 1);

    rootLayout.addWidget(headerPanel);
    rootLayout.addWidget(topPanel);
    rootLayout.addWidget(hboxPanel);

    // initially hiding header and bottom panel when no elements inside
    this._headerPanel.hide();

    this.layout = rootLayout;

    // Connect change listeners.
    this._tracker.currentChanged.connect(this._onCurrentChanged, this);
    this._tracker.activeChanged.connect(this._onActiveChanged, this);

    // Connect main layout change listener.
    this._dockPanel.layoutModified.connect(this._onLayoutModified, this);
  }

  /**
   * A signal emitted when main area's active focus changes.
   */
  get activeChanged(): ISignal<this, ILabShell.IChangedArgs> {
    return this._activeChanged;
  }

  /**
   * The active widget in the shell's main area.
   */
  get activeWidget(): Widget | null {
    return this._tracker.activeWidget;
  }

  /**
   * A signal emitted when main area's current focus changes.
   */
  get currentChanged(): ISignal<this, ILabShell.IChangedArgs> {
    return this._currentChanged;
  }

  /**
   * The current widget in the shell's main area.
   */
  get currentWidget(): Widget | null {
    return this._tracker.currentWidget;
  }

  /**
   * A signal emitted when the main area's layout is modified.
   */
  get layoutModified(): ISignal<this, void> {
    return this._layoutModified;
  }

  /**
   * Whether JupyterLab is in presentation mode with the
   * `jp-mod-presentationMode` CSS class.
   */
  get presentationMode(): boolean {
    return this.hasClass('jp-mod-presentationMode');
  }

  /**
   * Enable/disable presentation mode (`jp-mod-presentationMode` CSS class) with
   * a boolean.
   */
  set presentationMode(value: boolean) {
    this.toggleClass('jp-mod-presentationMode', value);
  }

  /**
   * The main dock area's user interface mode.
   */
  get mode(): DockPanel.Mode {
    return this._dockPanel.mode;
  }
  set mode(mode: DockPanel.Mode) {
    const dock = this._dockPanel;
    if (mode === dock.mode) {
      return;
    }

    const applicationCurrentWidget = this.currentWidget;

    if (mode === 'single-document') {
      this._cachedLayout = dock.saveLayout();
      dock.mode = mode;

      // In case the active widget in the dock panel is *not* the active widget
      // of the application, defer to the application.
      if (this.currentWidget) {
        dock.activateWidget(this.currentWidget);
      }

      // Set the mode data attribute on the application shell node.
      this.node.dataset.shellMode = mode;
      return;
    }

    // Cache a reference to every widget currently in the dock panel.
    const widgets = toArray(dock.widgets());

    // Toggle back to multiple document mode.
    dock.mode = mode;

    // Restore the original layout.
    if (this._cachedLayout) {
      // Remove any disposed widgets in the cached layout and restore.
      Private.normalizeAreaConfig(dock, this._cachedLayout.main);
      dock.restoreLayout(this._cachedLayout);
      this._cachedLayout = null;
    }

    // Add any widgets created during single document mode, which have
    // subsequently been removed from the dock panel after the multiple document
    // layout has been restored. If the widget has add options cached for
    // it (i.e., if it has been placed with respect to another widget),
    // then take that into account.
    widgets.forEach(widget => {
      if (!widget.parent) {
        this._addToMainArea(widget, {
          ...this._mainOptionsCache.get(widget),
          activate: false
        });
      }
    });
    this._mainOptionsCache.clear();

    // In case the active widget in the dock panel is *not* the active widget
    // of the application, defer to the application.
    if (applicationCurrentWidget) {
      dock.activateWidget(applicationCurrentWidget);
    }

    // Set the mode data attribute on the applications shell node.
    this.node.dataset.shellMode = mode;
  }

  /**
   * Promise that resolves when state is first restored, returning layout
   * description.
   */
  get restored(): Promise<ILabShell.ILayout> {
    return this._restored.promise;
  }

  /**
   * Activate a widget in its area.
   */
  activateById(id: string): void {

    const dock = this._dockPanel;
    const widget = find(dock.widgets(), value => value.id === id);

    if (widget) {
      dock.activateWidget(widget);
    }
  }

  /*
   * Activate the next Tab in the active TabBar.
   */
  activateNextTab(): void {
    let current = this._currentTabBar();
    if (!current) {
      return;
    }

    let ci = current.currentIndex;
    if (ci === -1) {
      return;
    }

    if (ci < current.titles.length - 1) {
      current.currentIndex += 1;
      if (current.currentTitle) {
        current.currentTitle.owner.activate();
      }
      return;
    }

    if (ci === current.titles.length - 1) {
      let nextBar = this._adjacentBar('next');
      if (nextBar) {
        nextBar.currentIndex = 0;
        if (nextBar.currentTitle) {
          nextBar.currentTitle.owner.activate();
        }
      }
    }
  }

  /*
   * Activate the previous Tab in the active TabBar.
   */
  activatePreviousTab(): void {
    let current = this._currentTabBar();
    if (!current) {
      return;
    }

    let ci = current.currentIndex;
    if (ci === -1) {
      return;
    }

    if (ci > 0) {
      current.currentIndex -= 1;
      if (current.currentTitle) {
        current.currentTitle.owner.activate();
      }
      return;
    }

    if (ci === 0) {
      let prevBar = this._adjacentBar('previous');
      if (prevBar) {
        let len = prevBar.titles.length;
        prevBar.currentIndex = len - 1;
        if (prevBar.currentTitle) {
          prevBar.currentTitle.owner.activate();
        }
      }
    }
  }

  add(
    widget: Widget,
    area: ILabShell.Area = 'main',
    options?: DocumentRegistry.IOpenOptions
  ): void {
    switch (area || 'main') {
      case 'main':
        return this._addToMainArea(widget, options);
      case 'header':
        return this._addToHeaderArea(widget, options);
      case 'top':
        return this._addToTopArea(widget, options);
      default:
        throw new Error(`Invalid area: ${area}`);
    }
  }

  /**
   * Dispose the shell.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._layoutDebouncer.dispose();
    super.dispose();
  }

  /**
   * Close all widgets in the main area.
   */
  closeAll(): void {
    // Make a copy of all the widget in the dock panel (using `toArray()`)
    // before removing them because removing them while iterating through them
    // modifies the underlying data of the iterator.
    toArray(this._dockPanel.widgets()).forEach(widget => widget.close());
  }

  /**
   * True if the given area is empty.
   */
  isEmpty(area: ILabShell.Area): boolean {
    switch (area) {
      case 'main':
        return this._dockPanel.isEmpty;
      case 'header':
        return this._headerPanel.widgets.length === 0;
      case 'top':
        return this._topPanel.widgets.length === 0;
      default:
        return true;
    }
  }

  /**
   * Restore the layout state for the application shell.
   */
  restoreLayout(layout: ILabShell.ILayout): void {
    const { mainArea } = layout;

    // Rehydrate the main area.
    if (mainArea) {
      const { currentWidget, dock, mode } = mainArea;

      if (dock) {
        this._dockPanel.restoreLayout(dock);
      }
      if (mode) {
        this.mode = mode;
      }
      if (currentWidget) {
        this.activateById(currentWidget.id);
      }
    }

    if (!this._isRestored) {
      // Make sure all messages in the queue are finished before notifying
      // any extensions that are waiting for the promise that guarantees the
      // application state has been restored.
      MessageLoop.flush();
      this._restored.resolve(layout);
    }
  }

  /**
   * Save the dehydrated state of the application shell.
   */
  saveLayout(): ILabShell.ILayout {
    // If the application is in single document mode, use the cached layout if
    // available. Otherwise, default to querying the dock panel for layout.
    return {
      mainArea: {
        currentWidget: this._tracker.currentWidget,
        dock:
          this.mode === 'single-document'
            ? this._cachedLayout || this._dockPanel.saveLayout()
            : this._dockPanel.saveLayout(),
        mode: this._dockPanel.mode
      }
    };
  }

  /**
   * Returns the widgets for an application area.
   */
  widgets(area?: ILabShell.Area): IIterator<Widget> {
    switch (area || 'main') {
      case 'main':
        return this._dockPanel.widgets();
      case 'header':
        return this._headerPanel.children();
      case 'top':
        return this._topPanel.children();
      default:
        throw new Error(`Invalid area: ${area}`);
    }
  }

  /**
   * Handle `after-attach` messages for the application shell.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.dataset.shellMode = this.mode;
  }


  /**
   * Add a widget to the main content area.
   *
   * #### Notes
   * Widgets must have a unique `id` property, which will be used as the DOM id.
   * All widgets added to the main area should be disposed after removal
   * (disposal before removal will remove the widget automatically).
   *
   * In the options, `ref` defaults to `null`, `mode` defaults to `'tab-after'`,
   * and `activate` defaults to `true`.
   */
  private _addToMainArea(
    widget: Widget,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (!widget.id) {
      console.error('Widgets added to app shell must have unique id property.');
      return;
    }

    options = options || {};

    const dock = this._dockPanel;
    const mode = options.mode || 'tab-after';
    let ref: Widget | null = this.currentWidget;

    if (options.ref) {
      ref = find(dock.widgets(), value => value.id === options.ref!) || null;
    }

    // Add widget ID to tab so that we can get a handle on the tab's widget
    // (for context menu support)
    widget.title.dataset = { ...widget.title.dataset, id: widget.id };

    dock.addWidget(widget, { mode, ref });

    // The dock panel doesn't account for placement information while
    // in single document mode, so upon rehydrating any widgets that were
    // added will not be in the correct place. Cache the placement information
    // here so that we can later rehydrate correctly.
    if (dock.mode === 'single-document') {
      this._mainOptionsCache.set(widget, options);
    }

    if (options.activate !== false) {
      dock.activateWidget(widget);
    }
  }

  /**
   * Add a widget to the top content area.
   *
   * #### Notes
   * Widgets must have a unique `id` property, which will be used as the DOM id.
   */
  private _addToTopArea(
    widget: Widget,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (!widget.id) {
      console.error('Widgets added to app shell must have unique id property.');
      return;
    }
    // Temporary: widgets are added to the panel in order of insertion.
    this._topPanel.addWidget(widget);
    this._onLayoutModified();
  }

  /**
   * Add a widget to the header content area.
   *
   * #### Notes
   * Widgets must have a unique `id` property, which will be used as the DOM id.
   */
  private _addToHeaderArea(
    widget: Widget,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (!widget.id) {
      console.error('Widgets added to app shell must have unique id property.');
      return;
    }
    // Temporary: widgets are added to the panel in order of insertion.
    this._headerPanel.addWidget(widget);
    this._onLayoutModified();

    if (this._headerPanel.isHidden) {
      this._headerPanel.show();
    }
  }

  /*
   * Return the tab bar adjacent to the current TabBar or `null`.
   */
  private _adjacentBar(direction: 'next' | 'previous'): TabBar<Widget> | null {
    const current = this._currentTabBar();
    if (!current) {
      return null;
    }

    const bars = toArray(this._dockPanel.tabBars());
    const len = bars.length;
    const index = bars.indexOf(current);

    if (direction === 'previous') {
      return index > 0 ? bars[index - 1] : index === 0 ? bars[len - 1] : null;
    }

    // Otherwise, direction is 'next'.
    return index < len - 1
      ? bars[index + 1]
      : index === len - 1
      ? bars[0]
      : null;
  }

  /*
   * Return the TabBar that has the currently active Widget or null.
   */
  private _currentTabBar(): TabBar<Widget> | null {
    const current = this._tracker.currentWidget;
    if (!current) {
      return null;
    }

    const title = current.title;
    const bars = this._dockPanel.tabBars();
    return find(bars, bar => bar.titles.indexOf(title) > -1) || null;
  }

  /**
   * Handle a change to the dock area active widget.
   */
  private _onActiveChanged(
    sender: any,
    args: FocusTracker.IChangedArgs<Widget>
  ): void {
    if (args.newValue) {
      args.newValue.title.className += ` ${ACTIVE_CLASS}`;
    }
    if (args.oldValue) {
      args.oldValue.title.className = args.oldValue.title.className.replace(
        ACTIVE_CLASS,
        ''
      );
    }
    this._activeChanged.emit(args);
  }

  /**
   * Handle a change to the dock area current widget.
   */
  private _onCurrentChanged(
    sender: any,
    args: FocusTracker.IChangedArgs<Widget>
  ): void {
    if (args.newValue) {
      args.newValue.title.className += ` ${CURRENT_CLASS}`;
    }
    if (args.oldValue) {
      args.oldValue.title.className = args.oldValue.title.className.replace(
        CURRENT_CLASS,
        ''
      );
    }
    this._currentChanged.emit(args);
    this._onLayoutModified();
  }

  /**
   * Handle a change to the layout.
   */
  private _onLayoutModified(): void {
    void this._layoutDebouncer.invoke();
  }

  /**
   * A message hook for child add/remove messages on the main area dock panel.
   */
  private _dockChildHook = (
    handler: IMessageHandler,
    msg: Message
  ): boolean => {
    switch (msg.type) {
      case 'child-added':
        (msg as Widget.ChildMessage).child.addClass(ACTIVITY_CLASS);
        this._tracker.add((msg as Widget.ChildMessage).child);
        break;
      case 'child-removed':
        (msg as Widget.ChildMessage).child.removeClass(ACTIVITY_CLASS);
        this._tracker.remove((msg as Widget.ChildMessage).child);
        break;
      default:
        break;
    }
    return true;
  };

  private _activeChanged = new Signal<this, ILabShell.IChangedArgs>(this);
  private _cachedLayout: DockLayout.ILayoutConfig | null = null;
  private _currentChanged = new Signal<this, ILabShell.IChangedArgs>(this);
  private _dockPanel: DockPanel;
  private _isRestored = false;
  private _layoutModified = new Signal<this, void>(this);
  private _layoutDebouncer = new Debouncer(() => {
    this._layoutModified.emit(undefined);
  }, 0);
  private _restored = new PromiseDelegate<ILabShell.ILayout>();
  private _tracker = new FocusTracker<Widget>();
  private _headerPanel: Panel;
  private _topPanel: Panel;
  private _mainOptionsCache = new Map<Widget, DocumentRegistry.IOpenOptions>();
}

namespace Private {
  /**
   * An object which holds a widget and its sort rank.
   */
  export interface IRankItem {
    /**
     * The widget for the item.
     */
    widget: Widget;

    /**
     * The sort rank of the widget.
     */
    rank: number;
  }

  /**
   * A less-than comparison function for side bar rank items.
   */
  export function itemCmp(first: IRankItem, second: IRankItem): number {
    return first.rank - second.rank;
  }

  /**
   * Removes widgets that have been disposed from an area config, mutates area.
   */
  export function normalizeAreaConfig(
    parent: DockPanel,
    area?: DockLayout.AreaConfig | null
  ): void {
    if (!area) {
      return;
    }
    if (area.type === 'tab-area') {
      area.widgets = area.widgets.filter(
        widget => !widget.isDisposed && widget.parent === parent
      ) as Widget[];
      return;
    }
    area.children.forEach(child => {
      normalizeAreaConfig(parent, child);
    });
  }
}
