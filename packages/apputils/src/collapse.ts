// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Message } from '@phosphor/messaging';
import { ISignal, Signal } from '@phosphor/signaling';
import { Widget, Panel, PanelLayout, Title } from '@phosphor/widgets';

/**
 * A panel that supports a collapsible header made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export class Collapse<T extends Widget = Widget> extends Widget {
  constructor(options: Collapse.IOptions<T>) {
    super(options);
    const { widget, collapsed = true } = options;

    this.addClass('jp-Collapse');
    this._header = new Widget();
    this._header.addClass('jp-Collapse-header');
    this._content = new Panel();
    this._content.addClass('jp-Collapse-contents');

    let layout = new PanelLayout();
    this.layout = layout;
    layout.addWidget(this._header);
    layout.addWidget(this._content);

    this.widget = widget;
    this.collapsed = collapsed;
  }

  /**
   * The widget inside the collapse panel.
   */
  get widget(): T {
    return this._widget;
  }
  set widget(widget: T) {
    let oldWidget = this._widget;
    if (oldWidget) {
      oldWidget.title.changed.disconnect(this._onTitleChanged, this);
      oldWidget.parent = null;
    }
    this._widget = widget;
    widget.title.changed.connect(this._onTitleChanged, this);
    this._onTitleChanged(widget.title);
    this._content.addWidget(widget);
  }

  /**
   * The collapsed state of the panel.
   */
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(value: boolean) {
    if (value === this._collapsed) {
      return;
    }
    if (value) {
      this._collapse();
    } else {
      this._uncollapse();
    }
  }

  /**
   * A signal for when the widget collapse state changes.
   */
  get collapseChanged(): ISignal<Collapse, void> {
    return this._collapseChanged;
  }

  /**
   * Toggle the collapse state of the panel.
   */
  toggle() {
    this.collapsed = !this.collapsed;
  }

  /**
   * Dispose the widget.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    // Delete references we explicitly hold to other widgets.
    delete this._header;
    delete this._widget;
    delete this._content;

    super.dispose();
  }

  /**
   * Handle the DOM events for the Collapse widget.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        this._evtClick(event as MouseEvent);
        break;
      default:
        break;
    }
  }

  protected onAfterAttach(msg: Message) {
    this._header.node.addEventListener('click', this);
  }

  protected onBeforeDetach(msg: Message) {
    this._header.node.removeEventListener('click', this);
  }

  private _collapse() {
    this._collapsed = true;
    if (this._content) {
      this._content.hide();
    }
    this.removeClass('jp-Collapse-open');
    this._collapseChanged.emit(void 0);
  }

  private _uncollapse() {
    this._collapsed = false;
    if (this._content) {
      this._content.show();
    }
    this.addClass('jp-Collapse-open');
    this._collapseChanged.emit(void 0);
  }

  private _evtClick(event: MouseEvent) {
    this.toggle();
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title<Widget>): void {
    this._header.node.textContent = this._widget.title.label;
  }

  private _collapseChanged = new Signal<this, void>(this);
  private _collapsed: boolean;
  private _content: Panel;
  private _header: Widget;
  private _widget: T;
}

export namespace Collapse {
  export interface IOptions<T extends Widget = Widget> extends Widget.IOptions {
    widget: T;
    collapsed?: boolean;
  }
}
