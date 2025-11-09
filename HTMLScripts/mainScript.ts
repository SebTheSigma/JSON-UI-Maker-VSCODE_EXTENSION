import { Panel } from "./panel.js";
import { makeElementResizable } from "./util/resizeUtil.js";

declare function acquireVsCodeApi(): {
    postMessage: (message: any) => void;
};

export const vscode = acquireVsCodeApi();

export const container = document.getElementById("container")!;

// Listen for messages from the extension
window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "add_element") {
        const data: any = msg.data;
        const parentId: string = msg.parentId;

        switch (data.class) {
            case "panel": {
                const panel = new Panel(data, parentId);
                // Panel constructor enables its own resizing via makeElementResizable.
                break;
            }
        }
    } else if (msg.type === "delete_element") {
        const elementId = msg.dataID;
        const element = document.querySelector(`[data-id="${elementId}"]`) as HTMLElement | null;
        if (!element) {
            return;
        }

        const classInstance = WEB_SIDE_GLOBAL_ELEMENT_ID_MAP.get(elementId);
        if (classInstance) {
            classInstance.delete();
        }
    } else if (msg.type === "get_element_by_dataID") {
        const elementID = msg.dataID;
        console.warn("GETTING ELEMENT", elementID, msg);

        const element = document.querySelector(`[data-id="${elementID}"]`) as HTMLElement | null;
        if (!element) {
            console.warn("Element not found Error: 01");
            return;
        }

        const elementData = {
            tag: element.tagName.toLowerCase(),
            class: element.className,
            dataset: { ...element.dataset },
            style: {
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height,
                zIndex: Number(element.style.zIndex),
            },
            text: element.textContent || "",
        };

        console.warn("MESSAGE POSTING", elementData);
        vscode.postMessage({
            type: "element",
            from: msg.from,
            element: elementData,
        });
        console.warn("MESSAGE POSTED");
    }
});

const buttons = ["add_panel", "delete_selected"];

for (const button of buttons) {
    const buttonElement = document.getElementById(button)!;
    buttonElement.addEventListener("click", () => {
        vscode.postMessage({
            type: "button_clicked",
            id: button,
        });
    });
}

export type ALL_ELEMENTS = Panel;
export type RESIZEABLE_ELEMENTS = Panel;
export const WEB_SIDE_GLOBAL_ELEMENT_ID_MAP = new Map<string, ALL_ELEMENTS>();

let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    if (!lastWidth || lastWidth <= 0) {
        lastWidth = newWidth;
        return;
    }

    const scale = newWidth / lastWidth;
    if (!isFinite(scale) || scale === 0) {
        lastWidth = newWidth;
        return;
    }

    // Update baseline
    lastWidth = newWidth;
    console.log("Resized", scale);

    // All elements with a data-id, so all json-ui elements.
    const elements = document.querySelectorAll("[data-id]");
    elements.forEach((el) => {
        const style = (el as HTMLElement).style;

        const left = Number(style.left.replace(/[A-Za-z]/g, ""));
        const top = Number(style.top.replace(/[A-Za-z]/g, ""));
        const width = Number(style.width.replace(/[A-Za-z]/g, ""));
        const height = Number(style.height.replace(/[A-Za-z]/g, ""));

        // Only apply scaling when we have valid numeric values; this avoids corrupting elements
        // that rely on auto/percentage or unset styles.
        if (isFinite(left)) {
            style.left = `${left * scale}px`;
        }
        if (isFinite(top)) {
            style.top = `${top * scale}px`;
        }
        if (isFinite(width) && width > 0) {
            style.width = `${width * scale}px`;
        }
        if (isFinite(height) && height > 0) {
            style.height = `${height * scale}px`;
        }
    });
});
