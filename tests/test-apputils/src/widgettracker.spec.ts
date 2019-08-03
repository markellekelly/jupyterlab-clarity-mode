// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { WidgetTracker } from '@jupyterlab/apputils';

import { signalToPromise, testEmission } from '@jupyterlab/testutils';

import { Panel, Widget } from '@phosphor/widgets';

import { simulate } from 'simulate-event';

const namespace = 'widget-tracker-test';

class TestTracker<T extends Widget> extends WidgetTracker<T> {
  methods: string[] = [];

  protected onCurrentChanged(widget: T): void {
    super.onCurrentChanged(widget);
    this.methods.push('onCurrentChanged');
  }
}

function createWidget(): Widget {
  const widget = new Widget({ node: document.createElement('button') });
  widget.node.style.minHeight = '20px';
  widget.node.style.minWidth = '20px';
  widget.node.tabIndex = -1;
  widget.node.textContent = 'Test Button';
  return widget;
}

function focus(widget: Widget): void {
  widget.node.focus();
  simulate(widget.node, 'focus');
}

describe('@jupyterlab/apputils', () => {
  describe('WidgetTracker', () => {
    let tracker: WidgetTracker;

    beforeEach(() => {
      tracker = new WidgetTracker({ namespace });
    });

    afterEach(() => {
      tracker.dispose();
    });

    describe('#constructor()', () => {
      it('should create an WidgetTracker', () => {
        expect(tracker).to.be.an.instanceof(WidgetTracker);
      });
    });

    describe('#currentChanged', () => {
      it('should emit when the current widget has been updated', async () => {
        const widget = createWidget();
        let promise = signalToPromise(tracker.currentChanged);

        Widget.attach(widget, document.body);
        focus(widget);
        void tracker.add(widget);
        await promise;
        widget.dispose();
      });
    });

    describe('#widgetAdded', () => {
      it('should emit when a widget has been added', async () => {
        const widget = createWidget();
        let promise = signalToPromise(tracker.widgetAdded);

        await tracker.add(widget);

        const [sender, args] = await promise;

        expect(sender).to.equal(tracker);
        expect(args).to.equal(widget);
        widget.dispose();
      });

      it('should not emit when a widget has been injected', async () => {
        const one = createWidget();
        const two = createWidget();
        let total = 0;
        let promise = testEmission(tracker.currentChanged, {
          find: () => {
            return total === 1;
          }
        });

        tracker.widgetAdded.connect(() => {
          total++;
        });
        void tracker.add(one);
        void tracker.inject(two);
        Widget.attach(two, document.body);
        focus(two);
        Widget.detach(two);
        await promise;
        one.dispose();
        two.dispose();
      });
    });

    describe('#currentWidget', () => {
      it('should default to null', () => {
        expect(tracker.currentWidget).to.be.null;
      });

      it('should be updated when a widget is added', async () => {
        const widget = createWidget();

        await tracker.add(widget);
        expect(tracker.currentWidget).to.equal(widget);
        widget.dispose();
      });

      it('should be updated when a widget is focused', async () => {
        const panel = new Panel();
        const widget0 = createWidget();
        const widget1 = createWidget();

        await tracker.add(widget0);
        await tracker.add(widget1);
        panel.addWidget(widget0);
        panel.addWidget(widget1);
        Widget.attach(panel, document.body);
        expect(tracker.currentWidget).to.equal(widget1);
        focus(widget0);
        expect(tracker.currentWidget).to.equal(widget0);
        panel.dispose();
        widget0.dispose();
        widget1.dispose();
      });

      it('should revert to last added widget on widget disposal', async () => {
        const one = createWidget();
        const two = createWidget();

        await tracker.add(one);
        await tracker.add(two);
        focus(one);
        focus(two);
        expect(tracker.currentWidget).to.equal(two);
        two.dispose();
        expect(tracker.currentWidget).to.equal(one);
        one.dispose();
      });

      it('should preserve the tracked widget on widget disposal', () => {
        const panel = new Panel();
        const widgets = [createWidget(), createWidget(), createWidget()];

        widgets.forEach(widget => {
          void tracker.add(widget);
          panel.addWidget(widget);
        });
        Widget.attach(panel, document.body);

        focus(widgets[0]);
        expect(tracker.currentWidget).to.equal(widgets[0]);

        let called = false;
        tracker.currentChanged.connect(() => {
          called = true;
        });
        widgets[2].dispose();
        expect(tracker.currentWidget).to.equal(widgets[0]);
        expect(called).to.equal(false);
        panel.dispose();
        widgets.forEach(widget => {
          widget.dispose();
        });
      });

      it('should select the previously added widget on widget disposal', () => {
        const panel = new Panel();
        const widgets = [createWidget(), createWidget(), createWidget()];

        Widget.attach(panel, document.body);
        widgets.forEach(widget => {
          void tracker.add(widget);
          panel.addWidget(widget);
          focus(widget);
        });

        let called = false;
        tracker.currentChanged.connect(() => {
          called = true;
        });
        widgets[2].dispose();
        expect(tracker.currentWidget).to.equal(widgets[1]);
        expect(called).to.equal(true);
        panel.dispose();
        widgets.forEach(widget => {
          widget.dispose();
        });
      });
    });

    describe('#isDisposed', () => {
      it('should test whether the tracker is disposed', () => {
        expect(tracker.isDisposed).to.equal(false);
        tracker.dispose();
        expect(tracker.isDisposed).to.equal(true);
      });
    });

    describe('#add()', () => {
      it('should add a widget to the tracker', async () => {
        const widget = createWidget();
        expect(tracker.has(widget)).to.equal(false);
        await tracker.add(widget);
        expect(tracker.has(widget)).to.equal(true);
        widget.dispose();
      });

      it('should reject a widget that already exists', async () => {
        const widget = createWidget();
        let failed = false;
        expect(tracker.has(widget)).to.equal(false);
        await tracker.add(widget);
        expect(tracker.has(widget)).to.equal(true);
        try {
          await tracker.add(widget);
        } catch (error) {
          failed = true;
        }
        expect(failed).to.equal(true);
        widget.dispose();
      });

      it('should reject a widget that is disposed', async () => {
        const widget = createWidget();
        let failed = false;
        expect(tracker.has(widget)).to.equal(false);
        widget.dispose();
        try {
          await tracker.add(widget);
        } catch (error) {
          failed = true;
        }
        expect(failed).to.equal(true);
        widget.dispose();
      });

      it('should remove an added widget if it is disposed', async () => {
        const widget = createWidget();
        await tracker.add(widget);
        expect(tracker.has(widget)).to.equal(true);
        widget.dispose();
        expect(tracker.has(widget)).to.equal(false);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources used by the tracker', () => {
        expect(tracker.isDisposed).to.equal(false);
        tracker.dispose();
        expect(tracker.isDisposed).to.equal(true);
      });

      it('should be safe to call multiple times', () => {
        expect(tracker.isDisposed).to.equal(false);
        tracker.dispose();
        tracker.dispose();
        expect(tracker.isDisposed).to.equal(true);
      });
    });

    describe('#find()', () => {
      it('should find a tracked item that matches a filter function', () => {
        const widgetA = createWidget();
        const widgetB = createWidget();
        const widgetC = createWidget();
        widgetA.id = 'A';
        widgetB.id = 'B';
        widgetC.id = 'C';
        void tracker.add(widgetA);
        void tracker.add(widgetB);
        void tracker.add(widgetC);
        expect(tracker.find(widget => widget.id === 'B')).to.equal(widgetB);
        widgetA.dispose();
        widgetB.dispose();
        widgetC.dispose();
      });

      it('should return a void if no item is found', () => {
        const widgetA = createWidget();
        const widgetB = createWidget();
        const widgetC = createWidget();
        widgetA.id = 'A';
        widgetB.id = 'B';
        widgetC.id = 'C';
        void tracker.add(widgetA);
        void tracker.add(widgetB);
        void tracker.add(widgetC);
        expect(tracker.find(widget => widget.id === 'D')).to.not.be.ok;
        widgetA.dispose();
        widgetB.dispose();
        widgetC.dispose();
      });
    });

    describe('#filter()', () => {
      it('should filter according to a predicate function', () => {
        const widgetA = createWidget();
        const widgetB = createWidget();
        const widgetC = createWidget();
        widgetA.id = 'include-A';
        widgetB.id = 'include-B';
        widgetC.id = 'exclude-C';
        void tracker.add(widgetA);
        void tracker.add(widgetB);
        void tracker.add(widgetC);
        const list = tracker.filter(
          widget => widget.id.indexOf('include') !== -1
        );
        expect(list.length).to.equal(2);
        expect(list[0]).to.equal(widgetA);
        expect(list[1]).to.equal(widgetB);
        widgetA.dispose();
        widgetB.dispose();
        widgetC.dispose();
      });

      it('should return an empty array if no item is found', () => {
        const widgetA = createWidget();
        const widgetB = createWidget();
        const widgetC = createWidget();
        widgetA.id = 'A';
        widgetB.id = 'B';
        widgetC.id = 'C';
        void tracker.add(widgetA);
        void tracker.add(widgetB);
        void tracker.add(widgetC);
        expect(tracker.filter(widget => widget.id === 'D').length).to.equal(0);
        widgetA.dispose();
        widgetB.dispose();
        widgetC.dispose();
      });
    });

    describe('#forEach()', () => {
      it('should iterate through all the tracked items', () => {
        const widgetA = createWidget();
        const widgetB = createWidget();
        const widgetC = createWidget();
        let visited = '';
        widgetA.id = 'A';
        widgetB.id = 'B';
        widgetC.id = 'C';
        void tracker.add(widgetA);
        void tracker.add(widgetB);
        void tracker.add(widgetC);
        tracker.forEach(widget => {
          visited += widget.id;
        });
        expect(visited).to.equal('ABC');
        widgetA.dispose();
        widgetB.dispose();
        widgetC.dispose();
      });
    });

    describe('#has()', () => {
      it('should return `true` if an item exists in the tracker', () => {
        const widget = createWidget();
        expect(tracker.has(widget)).to.equal(false);
        void tracker.add(widget);
        expect(tracker.has(widget)).to.equal(true);
        widget.dispose();
      });
    });

    describe('#inject()', () => {
      it('should inject a widget into the tracker', async () => {
        const widget = createWidget();
        expect(tracker.has(widget)).to.equal(false);
        void tracker.inject(widget);
        expect(tracker.has(widget)).to.equal(true);
        widget.dispose();
      });

      it('should remove an injected widget if it is disposed', async () => {
        const widget = createWidget();
        void tracker.inject(widget);
        expect(tracker.has(widget)).to.equal(true);
        widget.dispose();
        expect(tracker.has(widget)).to.equal(false);
      });
    });

    describe('#onCurrentChanged()', () => {
      it('should be called when the current widget is changed', async () => {
        const tracker = new TestTracker({ namespace });
        const widget = createWidget();
        await tracker.add(widget);
        expect(tracker.methods).to.contain('onCurrentChanged');
        widget.dispose();
      });
    });
  });
});
