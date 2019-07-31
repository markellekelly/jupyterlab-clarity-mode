"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nbpage_1 = require("./nbpage");
const React = __importStar(require("react"));
const App = (props) => {
    return (React.createElement(nbpage_1.NotebookPage, { notebookPath: props.path, serviceManager: props.serviceManager, rendermime: props.renderMime }));
};
exports.App = App;
