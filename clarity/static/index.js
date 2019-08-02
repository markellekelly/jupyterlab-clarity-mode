"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const services_1 = require("@jupyterlab/services");
require("@jupyterlab/application/style/index.css");
require("@jupyterlab/theme-light-extension/style/index.css");
//import { MathJaxTypesetter } from '@jupyterlab/mathjax2';
const rendermime_1 = require("@jupyterlab/rendermime");
const app_1 = require("./app");
function main() {
    let manager = new services_1.ServiceManager();
    let path = "Untitled1.ipynb";
    const rendermime = new rendermime_1.RenderMimeRegistry({
        initialFactories: rendermime_1.standardRendererFactories,
    });
    ReactDOM.render(React.createElement(app_1.App, { path: path, serviceManager: manager, renderMime: rendermime }), document.getElementById('clarity-container'));
}
exports.main = main;
window.addEventListener('load', main);
