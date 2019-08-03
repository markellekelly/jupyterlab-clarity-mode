// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { CommandRegistry } from '@phosphor/commands';

import { Widget } from '@phosphor/widgets';

import { WidgetTracker } from '@jupyterlab/apputils';

import { ViewMenu, IViewMenu } from '@jupyterlab/mainmenu';

import { delegateExecute, delegateToggled } from './util';

class Wodget extends Widget {
  wrapped: boolean = false;
  matched: boolean = false;
  numbered: boolean = false;
}

describe('@jupyterlab/mainmenu', () => {
  describe('ViewMenu', () => {
    let commands: CommandRegistry;
    let menu: ViewMenu;
    let tracker: WidgetTracker<Wodget>;
    let wodget: Wodget;

    beforeAll(() => {
      commands = new CommandRegistry();
    });

    beforeEach(() => {
      wodget = new Wodget();
      menu = new ViewMenu({ commands });
      tracker = new WidgetTracker<Wodget>({ namespace: 'wodget' });
      void tracker.add(wodget);
    });

    afterEach(() => {
      menu.dispose();
      tracker.dispose();
      wodget.dispose();
    });

    describe('#constructor()', () => {
      it('should construct a new view menu', () => {
        expect(menu).to.be.an.instanceof(ViewMenu);
        expect(menu.menu.title.label).to.equal('View');
      });
    });

    describe('#editorViewers', () => {
      it('should allow setting of an IEditorViewer', () => {
        const viewer: IViewMenu.IEditorViewer<Wodget> = {
          tracker,
          toggleLineNumbers: widget => {
            widget.numbered = !widget.numbered;
            return;
          },
          toggleMatchBrackets: widget => {
            widget.matched = !widget.matched;
            return;
          },
          toggleWordWrap: widget => {
            widget.wrapped = !widget.wrapped;
            return;
          },
          matchBracketsToggled: widget => widget.matched,
          lineNumbersToggled: widget => widget.numbered,
          wordWrapToggled: widget => widget.wrapped
        };
        menu.editorViewers.add(viewer);

        expect(
          delegateToggled(wodget, menu.editorViewers, 'matchBracketsToggled')
        ).to.equal(false);
        expect(
          delegateToggled(wodget, menu.editorViewers, 'wordWrapToggled')
        ).to.equal(false);
        expect(
          delegateToggled(wodget, menu.editorViewers, 'lineNumbersToggled')
        ).to.equal(false);

        void delegateExecute(wodget, menu.editorViewers, 'toggleLineNumbers');
        void delegateExecute(wodget, menu.editorViewers, 'toggleMatchBrackets');
        void delegateExecute(wodget, menu.editorViewers, 'toggleWordWrap');

        expect(
          delegateToggled(wodget, menu.editorViewers, 'matchBracketsToggled')
        ).to.equal(true);
        expect(
          delegateToggled(wodget, menu.editorViewers, 'wordWrapToggled')
        ).to.equal(true);
        expect(
          delegateToggled(wodget, menu.editorViewers, 'lineNumbersToggled')
        ).to.equal(true);
      });
    });
  });
});
