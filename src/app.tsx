import { ServiceManager } from '@jupyterlab/services';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { NotebookPage } from './nbpage';

import * as React from 'react';

export interface AppProps {
  path: string,
  serviceManager: ServiceManager,
  renderMime: RenderMimeRegistry
}

const App = (props: AppProps) => {
  return (
    <NotebookPage
      notebookPath={props.path}
      serviceManager={props.serviceManager}
      rendermime={props.renderMime}
    />
  );
};

export { App };