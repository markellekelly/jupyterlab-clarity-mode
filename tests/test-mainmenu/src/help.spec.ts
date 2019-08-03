// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { CommandRegistry } from '@phosphor/commands';

import { HelpMenu } from '@jupyterlab/mainmenu';

describe('@jupyterlab/mainmenu', () => {
  describe('HelpMenu', () => {
    let commands: CommandRegistry;
    let menu: HelpMenu;

    beforeAll(() => {
      commands = new CommandRegistry();
    });

    beforeEach(() => {
      menu = new HelpMenu({ commands });
    });

    afterEach(() => {
      menu.dispose();
    });

    describe('#constructor()', () => {
      it('should construct a new help menu', () => {
        expect(menu).to.be.an.instanceof(HelpMenu);
        expect(menu.menu.title.label).to.equal('Help');
      });
    });
  });
});
