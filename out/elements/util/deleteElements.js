"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteElements = void 0;
const extension_js_1 = require("../../extension.js");
class DeleteElements {
    static deleteElement(elementID) {
        extension_js_1.MAIN_HTML.webview.postMessage({ type: "delete_element", dataID: elementID });
    }
}
exports.DeleteElements = DeleteElements;
//# sourceMappingURL=deleteElements.js.map