"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const extension_js_1 = require("../extension.js");
const Common_js_1 = require("../utils/Common.js");
const addElements_js_1 = require("./util/addElements.js");
const deleteElements_js_1 = require("./util/deleteElements.js");
class Panel {
    // Private members
    parentID;
    parentElement;
    elementID;
    constructor(parentID) {
        this.parentID = parentID;
        this.init();
    }
    async init() {
        if (!this.parentID) {
            const data = addElements_js_1.AddElements.addElement('panel');
            this.elementID = data.dataset.id;
            extension_js_1.GLOBAL_ELEMENT_ID_MAP.set(this.elementID, this);
            return;
        }
        this.parentElement = await (0, Common_js_1.getHTMLMimicElement)(this.parentID);
        // 80% of parent
        const parentWidth = Number(this.parentElement?.style.width.replace(/[A-Za-z]/g, ""));
        const parentHeight = Number(this.parentElement?.style.height.replace(/[A-Za-z]/g, ""));
        const width = parentWidth * 0.8;
        const height = parentHeight * 0.8;
        const data = addElements_js_1.AddElements.addElement('panel', this.parentID);
        this.elementID = data.dataset.id;
        extension_js_1.GLOBAL_ELEMENT_ID_MAP.set(this.elementID, this);
    }
    delete() {
        deleteElements_js_1.DeleteElements.deleteElement(this.parentID);
    }
}
exports.Panel = Panel;
//# sourceMappingURL=panel.js.map