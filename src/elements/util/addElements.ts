import { MAIN_HTML } from "../../extension.js";
import { M_HTMLElement } from "../../HTMLMimic/HTMLElement.js";
import { generateRandomId } from "../../utils/Common.js";

export class AddElements {
    public static addElement(elementType: string, parentID?: string): M_HTMLElement {
        
        const data: M_HTMLElement = {
            class: elementType,
            style: {
                border: "1px solid red"
            },
            dataset: {
                id: generateRandomId(10),
            },
        };

        MAIN_HTML!.webview.postMessage({
            type: "add_element",
            data,
            parentId: parentID
        });

        return data;
    }
}
