"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL_ELEMENT_ID_MAP = exports.selectedElementID = exports.HTMLElementSelectedEvent = exports.HTMLButtonClickedEvent = exports.MAIN_HTML = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const deleteElements_js_1 = require("./elements/util/deleteElements.js");
const EventEmitter_js_1 = require("./events/EventEmitter.js");
const panel_js_1 = require("./elements/panel.js");
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.HTMLButtonClickedEvent = new EventEmitter_js_1.EventEmitter();
exports.HTMLElementSelectedEvent = new EventEmitter_js_1.EventEmitter();
exports.GLOBAL_ELEMENT_ID_MAP = new Map();
exports.HTMLButtonClickedEvent.on((msg) => {
    if (msg === "add_panel") {
        console.log('add panel');
        new panel_js_1.Panel(exports.selectedElementID);
    }
    else if (msg === "delete_selected") {
        console.log('delete selected');
        if (exports.selectedElementID) {
            deleteElements_js_1.DeleteElements.deleteElement(exports.selectedElementID);
        }
    }
});
exports.HTMLElementSelectedEvent.on(msg => {
    console.log(msg);
    if (msg.selected) {
        exports.selectedElementID = msg.id;
    }
    else {
        exports.selectedElementID = undefined;
    }
    console.warn('selectedElementID', exports.selectedElementID);
});
function activate(context) {
    let disposable = vscode.commands.registerCommand("json-ui-maker.show", () => {
        exports.MAIN_HTML = vscode.window.createWebviewPanel("json-ui-maker", "My Webview", vscode.ViewColumn.One, { enableScripts: true });
        const jsPath = path.join(context.extensionPath, "out/HTMLScripts", "bundle.js");
        const jsCode = fs.readFileSync(jsPath, "utf8");
        console.log('code', jsCode);
        const cssPath = path.join(context.extensionPath, "media", "mainCSS.css");
        const cssCode = fs.readFileSync(cssPath, "utf8");
        console.log('code', cssCode);
        const htmlPath = path.join(context.extensionPath, "media", "mainHTML.html");
        let htmlCode = fs.readFileSync(htmlPath, "utf8");
        console.log(htmlCode);
        htmlCode = htmlCode.replace("{{mainScript}}", `<script>${jsCode}</script>`);
        htmlCode = htmlCode.replace("{{mainStyle}}", `<style>${cssCode}</style>`);
        // Initial HTML
        exports.MAIN_HTML.webview.html = htmlCode;
        // 🧩 Listen for messages from the webview
        exports.MAIN_HTML.webview.onDidReceiveMessage((msg) => {
            if (msg.type === "button_clicked") {
                exports.HTMLButtonClickedEvent.emit(msg.id);
            }
            if (msg.type === "element_selection_change") {
                exports.HTMLElementSelectedEvent.emit({ id: msg.id, selected: msg.selected });
            }
        });
    });
    console.log('HTML Applied');
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map