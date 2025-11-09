"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddElements = void 0;
const extension_1 = require("../extension");
const Common_1 = require("../utils/Common");
class AddElements {
    static addPanel(panelInfo) {
        const data = {
            class: "panel",
            style: {
                border: "1px solid red",
                left: `${panelInfo.left}px`,
                top: `${panelInfo.top}px`,
                width: `${panelInfo.width}px`,
                height: `${panelInfo.height}px`,
                zIndex: `${panelInfo.layer}`,
            },
            dataset: {
                id: "item-" + (0, Common_1.generateRandomId)(10),
            },
        };
        extension_1.MAIN_HTML.webview.postMessage({
            type: "addChild",
            data,
            parentId: undefined,
        });
        return data;
    }
}
exports.AddElements = AddElements;
//# sourceMappingURL=addElements.js.map