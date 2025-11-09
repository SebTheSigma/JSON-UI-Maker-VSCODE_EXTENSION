import { GLOBAL_ELEMENT_ID_MAP } from "../extension.js";
import { M_HTMLElement } from "../HTMLMimic/HTMLElement.js";
import { getHTMLMimicElement } from "../utils/Common.js";
import { AddElements } from "./util/addElements.js";
import { DeleteElements } from "./util/deleteElements.js";


export class Panel {

    // Private members
    private parentID: string | undefined;
    private parentElement: M_HTMLElement | undefined;

    public elementID: string | undefined;

    constructor(parentID?: string) {
        this.parentID = parentID;

        this.init();
    }

    private async init(): Promise<void> {

        if (!this.parentID) {
            const data: M_HTMLElement = AddElements.addElement('panel');

            this.elementID = data.dataset.id;
            GLOBAL_ELEMENT_ID_MAP.set(this.elementID, this);
            return;
        }

        this.parentElement = await getHTMLMimicElement(this.parentID!) as M_HTMLElement | undefined;

        // 80% of parent
        const parentWidth = Number(this.parentElement?.style.width!.replace(/[A-Za-z]/g, ""));
        const parentHeight = Number(this.parentElement?.style.height!.replace(/[A-Za-z]/g, ""));
        const width = parentWidth * 0.8;
        const height = parentHeight * 0.8;

        const data: M_HTMLElement = AddElements.addElement('panel', this.parentID!);

        this.elementID = data.dataset.id;
        GLOBAL_ELEMENT_ID_MAP.set(this.elementID, this);
    }

    public delete() {
        DeleteElements.deleteElement(this.parentID!);
    }
}
