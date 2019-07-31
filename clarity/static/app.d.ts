/// <reference types="react" />
import { ServiceManager } from '@jupyterlab/services';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
export interface AppProps {
    path: string;
    serviceManager: ServiceManager;
    renderMime: RenderMimeRegistry;
}
declare const App: (props: AppProps) => JSX.Element;
export { App };
