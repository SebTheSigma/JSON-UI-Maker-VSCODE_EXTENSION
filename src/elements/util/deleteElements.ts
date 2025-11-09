import { MAIN_HTML } from "../../extension.js";


export class DeleteElements {

    public static deleteElement(elementID: string) {
        MAIN_HTML!.webview.postMessage({ type: "delete_element", dataID: elementID });
    }
}