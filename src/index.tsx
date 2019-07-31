import '@jupyterlab/application/style/index.css';
import '@jupyterlab/theme-light-extension/style/index.css';

import { ServiceManager } from '@jupyterlab/services';
import { MathJaxTypesetter } from '@jupyterlab/mathjax2';

import {
  RenderMimeRegistry,
  standardRendererFactories as initialFactories
} from '@jupyterlab/rendermime';
import { PageConfig } from '@jupyterlab/coreutils';

import { App } from './app';
// // Our custom styles
// import '../../styles/index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

function main(): void {
  let manager = new ServiceManager();

  manager.ready.then(() => {
    //let path = PageConfig.getOption('path');
    let path="Untitled1.ipynb"
    const rendermime = new RenderMimeRegistry({
      initialFactories: initialFactories,
      latexTypesetter: new MathJaxTypesetter({
        url: PageConfig.getOption('mathjaxUrl'),
        config: PageConfig.getOption('mathjaxConfig')
      })
    });
    setTimeout(() => {
      console.log('timinout');
      this.timeout();
    }, 5000);

    ReactDOM.render(
      <App
        path={path}
        serviceManager={manager}
        renderMime={rendermime}
      />,
      document.getElementById('everything')
    );
  });
}

window.addEventListener('load', main);