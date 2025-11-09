import { MAIN_HTML } from "../extension.js";
import { Disposable } from 'vscode';
import { M_HTMLElement } from "../HTMLMimic/HTMLElement.js";

export function generateRandomId(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
}

export async function getHTMLMimicElement(stringID: string): Promise<M_HTMLElement | undefined> {
    const sendRequestID = generateRandomId(10);
    const timeoutSeconds = 3;

    console.warn(stringID, 'stringID');

    // Send the request to the webview
    MAIN_HTML!.webview.postMessage({
        type: "get_element_by_dataID",
        from: sendRequestID,
        dataID: stringID,
    });

    return new Promise<M_HTMLElement | undefined>((resolve) => {
        let settled = false;

        // Define a cleanup function to ensure all disposables are removed
        const cleanup = () => {
            if (!settled) {
                settled = true;
                disposable.dispose();
                clearTimeout(timer);
            }
        };

        // Listen for messages from the webview
        const handler = (msg: any) => {
            console.warn(msg, sendRequestID, 676767);
            if (msg.type === "element" && msg.from === sendRequestID) {
                cleanup();
                resolve(msg.element);
            }
        };

        // Register the event listener
        const disposable: Disposable = MAIN_HTML!.webview.onDidReceiveMessage(handler);

        // Set up timeout
        const timer = setTimeout(() => {
            cleanup();
            resolve(undefined); // timeout — return undefined
        }, timeoutSeconds * 1000);
    });
}
