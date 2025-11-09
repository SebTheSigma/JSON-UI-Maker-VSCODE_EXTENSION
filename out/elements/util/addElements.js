"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddElements = void 0;
const extension_js_1 = require("../../extension.js");
const Common_js_1 = require("../../utils/Common.js");
class AddElements {
    static addElement(elementType, parentID) {
        const data = {
            class: elementType,
            style: {
                border: "1px solid red"
            },
            dataset: {
                id: (0, Common_js_1.generateRandomId)(10),
            },
        };
        extension_js_1.MAIN_HTML.webview.postMessage({
            type: "add_element",
            data,
            parentId: parentID
        });
        return data;
    }
}
exports.AddElements = AddElements;
//# sourceMappingURL=addElements.js.map