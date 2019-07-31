"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@jupyterlab/application/style/index.css");
require("@jupyterlab/theme-light-extension/style/index.css");
const services_1 = require("@jupyterlab/services");
const mathjax2_1 = require("@jupyterlab/mathjax2");
const rendermime_1 = require("@jupyterlab/rendermime");
const coreutils_1 = require("@jupyterlab/coreutils");
const app_1 = require("./app");
// // Our custom styles
// import '../../styles/index.css';
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
function main() {
    let manager = new services_1.ServiceManager();
    manager.ready.then(() => {
        //let path = PageConfig.getOption('path');
        let path = "Untitled1.ipynb";
        const rendermime = new rendermime_1.RenderMimeRegistry({
            initialFactories: rendermime_1.standardRendererFactories,
            latexTypesetter: new mathjax2_1.MathJaxTypesetter({
                url: coreutils_1.PageConfig.getOption('mathjaxUrl'),
                config: coreutils_1.PageConfig.getOption('mathjaxConfig')
            })
        });
        setTimeout(() => {
            console.log('timinout');
            this.timeout();
        }, 5000);
        ReactDOM.render(React.createElement(app_1.App, { path: path, serviceManager: manager, renderMime: rendermime }), document.getElementById('everything'));
    });
}
window.addEventListener('load', main);
