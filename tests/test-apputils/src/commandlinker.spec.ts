// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { CommandRegistry } from '@phosphor/commands';

import { h, VirtualNode, VirtualDOM } from '@phosphor/virtualdom';

import { simulate } from 'simulate-event';

import { CommandLinker } from '@jupyterlab/apputils';

describe('@jupyterlab/apputils', () => {
  describe('CommandLinker', () => {
    describe('#constructor()', () => {
      it('should create a command linker', () => {
        const linker = new CommandLinker({ commands: new CommandRegistry() });
        expect(linker).to.be.an.instanceof(CommandLinker);
        linker.dispose();
      });
    });

    describe('#isDisposed', () => {
      it('should test whether a command linker has been disposed', () => {
        const linker = new CommandLinker({ commands: new CommandRegistry() });
        expect(linker.isDisposed).to.equal(false);
        linker.dispose();
        expect(linker.isDisposed).to.equal(true);
      });
    });

    describe('#connectNode()', () => {
      it('should connect a node to a command', () => {
        let called = false;
        const command = 'commandlinker:connect-node';
        const commands = new CommandRegistry();
        const linker = new CommandLinker({ commands });
        const node = document.createElement('div');
        const disposable = commands.addCommand(command, {
          execute: () => {
            called = true;
          }
        });

        document.body.appendChild(node);
        linker.connectNode(node, command, null);

        expect(called).to.equal(false);
        simulate(node, 'click');
        expect(called).to.equal(true);

        document.body.removeChild(node);
        linker.dispose();
        disposable.dispose();
      });
    });

    describe('#disconnectNode()', () => {
      it('should disconnect a node from a command', () => {
        let called = false;
        const command = 'commandlinker:disconnect-node';
        const commands = new CommandRegistry();
        const linker = new CommandLinker({ commands });
        const node = document.createElement('div');
        const disposable = commands.addCommand(command, {
          execute: () => {
            called = true;
          }
        });

        document.body.appendChild(node);
        linker.connectNode(node, command, null);

        // Make sure connection is working.
        expect(called).to.equal(false);
        simulate(node, 'click');
        expect(called).to.equal(true);

        // Reset flag.
        called = false;

        // Make sure disconnection is working.
        linker.disconnectNode(node);
        expect(called).to.equal(false);
        simulate(node, 'click');
        expect(called).to.equal(false);

        document.body.removeChild(node);
        linker.dispose();
        disposable.dispose();
      });
    });

    describe('#dispose()', () => {
      it('should dispose the resources held by the linker', () => {
        const linker = new CommandLinker({ commands: new CommandRegistry() });
        expect(linker.isDisposed).to.equal(false);
        linker.dispose();
        expect(linker.isDisposed).to.equal(true);
      });
    });

    describe('#populateVNodeDataset()', () => {
      it('should connect a node to a command', () => {
        let called = false;
        const command = 'commandlinker:connect-node';
        const commands = new CommandRegistry();
        const linker = new CommandLinker({ commands });
        let node: HTMLElement;
        let vnode: VirtualNode;
        const disposable = commands.addCommand(command, {
          execute: () => {
            called = true;
          }
        });

        vnode = h.div({ dataset: linker.populateVNodeDataset(command, null) });
        node = VirtualDOM.realize(vnode);
        document.body.appendChild(node);

        expect(called).to.equal(false);
        simulate(node, 'click');
        expect(called).to.equal(true);

        document.body.removeChild(node);
        linker.dispose();
        disposable.dispose();
      });
    });
  });
});
