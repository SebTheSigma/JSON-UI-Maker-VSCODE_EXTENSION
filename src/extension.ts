import { DeleteElements } from "./elements/util/deleteElements.js";
import { EventEmitter } from "./events/EventEmitter.js";
import { Panel } from "./elements/panel.js";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";


export let MAIN_HTML: vscode.WebviewPanel | undefined;
export let HTMLButtonClickedEvent: EventEmitter = new EventEmitter<any>();
export let HTMLElementSelectedEvent: EventEmitter = new EventEmitter<any>();
export let selectedElementID: string | undefined;

type ALL_ELEMENTS = Panel;

export const GLOBAL_ELEMENT_ID_MAP: Map<string, ALL_ELEMENTS> = new Map<string, ALL_ELEMENTS>();

HTMLButtonClickedEvent.on((msg: any) => {

    if (msg === "add_panel") {
        console.log('add panel');
        new Panel(selectedElementID);
    }

    else if (msg === "delete_selected") {
        console.log('delete selected');
        if (selectedElementID) {
            DeleteElements.deleteElement(selectedElementID);
        }
    }
});

HTMLElementSelectedEvent.on(msg => {
    console.log(msg);

    if (msg.selected) {
        selectedElementID = msg.id;
    }

    else {
        selectedElementID = undefined;
    }

    console.warn('selectedElementID', selectedElementID);
});

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand("json-ui-maker.show", () => {
        MAIN_HTML = vscode.window.createWebviewPanel("json-ui-maker", "My Webview", vscode.ViewColumn.One, { enableScripts: true });

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
        MAIN_HTML.webview.html = htmlCode;

        // 🧩 Listen for messages from the webview
        MAIN_HTML.webview.onDidReceiveMessage((msg) => {
            if (msg.type === "button_clicked") {
                HTMLButtonClickedEvent.emit(msg.id);
            }

            if (msg.type === "element_selection_change") {
                HTMLElementSelectedEvent.emit({ id: msg.id, selected: msg.selected });
            }
        });
    });

	console.log('HTML Applied');

    context.subscriptions.push(disposable);
}

export function deactivate() {}