"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomId = generateRandomId;
exports.getHTMLMimicElement = getHTMLMimicElement;
const extension_js_1 = require("../extension.js");
function generateRandomId(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}
async function getHTMLMimicElement(stringID) {
    const sendRequestID = generateRandomId(10);
    const timeoutSeconds = 3;
    console.warn(stringID, 'stringID');
    // Send the request to the webview
    extension_js_1.MAIN_HTML.webview.postMessage({
        type: "get_element_by_dataID",
        from: sendRequestID,
        dataID: stringID,
    });
    return new Promise((resolve) => {
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
        const handler = (msg) => {
            console.warn(msg, sendRequestID, 676767);
            if (msg.type === "element" && msg.from === sendRequestID) {
                cleanup();
                resolve(msg.element);
            }
        };
        // Register the event listener
        const disposable = extension_js_1.MAIN_HTML.webview.onDidReceiveMessage(handler);
        // Set up timeout
        const timer = setTimeout(() => {
            cleanup();
            resolve(undefined); // timeout — return undefined
        }, timeoutSeconds * 1000);
    });
}
//# sourceMappingURL=Common.js.map