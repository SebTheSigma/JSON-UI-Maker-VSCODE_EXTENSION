import { Panel } from "./panel.js";

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
            case "panel":
                new Panel(data, parentId);
                break;
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

type ALL_ELEMENTS = Panel;
export const WEB_SIDE_GLOBAL_ELEMENT_ID_MAP = new Map<string, ALL_ELEMENTS>();



let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
    const scale = window.innerWidth / lastWidth;

    // Update
    lastWidth = window.innerWidth;
    console.log("Resized", scale);

    // All elements with a data id, so all json-ui elements
    const elements = document.querySelectorAll("[data-id]");
    elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        style.left = `${Number(style.left.replace(/[A-Za-z]/g, "")) * scale}px`;
        style.top = `${Number(style.top.replace(/[A-Za-z]/g, "")) * scale}px`;

        style.width = `${Number(style.width.replace(/[A-Za-z]/g, "")) * scale}px`;
        style.height = `${Number(style.height.replace(/[A-Za-z]/g, "")) * scale}px`;
    });
});
