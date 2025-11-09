import { container, WEB_SIDE_GLOBAL_ELEMENT_ID_MAP, vscode } from "./mainScript.js";
import { makeElementResizable } from "./util/resizeUtil.js";

export class Panel {
    public data: any;
    public parentId: string;
    public el: HTMLElement;
    public parent: HTMLElement;

    public isDragging = false;
    public initialX = 0;
    public initialY = 0;
    public parentRect: DOMRect;
    
    private cleanupResize: (() => void) | null = null;

    constructor(data: any, parentId: string) {
        this.data = data;
        this.parentId = parentId;

        this.parent = document.querySelector(`[data-id="${parentId}"]`) ?? container;
        this.parentRect = this.parent.getBoundingClientRect();

        this.el = document.createElement("div");
        this.el.style.position = "absolute";

        const parentWidth = Number(this.parent?.style.width!.replace(/[A-Za-z]/g, "")) || this.parentRect.width;
        const parentHeight = Number(this.parent?.style.height!.replace(/[A-Za-z]/g, "")) || this.parentRect.height;

        this.el.style.zIndex = `${Number(this.parent.style.zIndex) + 1}`;
        this.el.style.width = `${parentWidth * 0.8}px`;
        this.el.style.height = `${parentHeight * 0.8}px`;

        this.el.style.left = `${parentWidth * 0.1}px`;
        this.el.style.top = `${parentHeight * 0.1}px`;

        this.init();
        this.parent.appendChild(this.el);

        WEB_SIDE_GLOBAL_ELEMENT_ID_MAP.set(this.data.dataset.id, this);
    }

    public init() {
        this.asignData();
        this.selectionSystem();

        this.el.addEventListener("mousedown", (event) => {
            this.startDrag(event);
        });

        document.addEventListener("mouseup", () => {
            this.stopDrag();
        });

        document.addEventListener("mousemove", (event) => {
            this.drag(event);
        });

        // Enable 8-direction resizing for this panel.
        this.cleanupResize = makeElementResizable(this.el, {
            parent: this.parent,
            minWidth: 40,
            minHeight: 40,
        });
    }

    public asignData() {
        for (const [key, value] of Object.entries(this.data.style || {})) {
            (this.el.style as any)[key] = value;
        }
        for (const [key, value] of Object.entries(this.data.dataset || {})) {
            (this.el.dataset as any)[key] = value;
        }

        for (let key of Object.keys(this.data)) {
            if (key === "style" || key === "dataset") {
                continue;
            }
            (this.el as any)[key] = this.data[key];
        }
    }

    public selectionSystem() {
        this.el.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            event.preventDefault();

            console.log("Double clicked");
            if (this.el.classList.contains("selected")) {
                this.el.classList.remove("selected");

                vscode.postMessage({
                    type: "element_selection_change",
                    id: this.data.dataset.id,
                    selected: false,
                });
                return;
            }

            // Remove selection from all other elements
            const selectedElements = document.querySelectorAll(".selected");
            selectedElements.forEach((element) => {
                element.classList.remove("selected");
            });

            this.el.classList.add("selected");

            vscode.postMessage({
                type: "element_selection_change",
                id: this.data.dataset.id,
                selected: true,
            });
        });
    }

    public startDrag(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.parentRect = this.parent.getBoundingClientRect();
        const rect = this.el.getBoundingClientRect();

        this.isDragging = true;
        this.initialX = event.clientX - rect.left;
        this.initialY = event.clientY - rect.top;
    }

    public stopDrag() {
        this.isDragging = false;
    }

    public drag(event: MouseEvent) {
        if (this.isDragging) {
            const deltaX = event.clientX - this.parentRect.left - this.initialX;
            const deltaY = event.clientY - this.parentRect.top - this.initialY;
            this.el.style.left = `${deltaX}px`;
            this.el.style.top = `${deltaY}px`;
        }
    }

    public delete() {
        if (this.el.classList.contains("selected")) {
            vscode.postMessage({
                type: "element_selection_change",
                id: this.data.dataset.id,
                selected: false,
            });
        }

        if (this.cleanupResize) {
            this.cleanupResize();
            this.cleanupResize = null;
        }

        this.parent.removeChild(this.el);

        document.removeEventListener("mouseup", () => {
            this.stopDrag();
        });

        document.removeEventListener("mousemove", (event) => {
            this.drag(event);
        });
    }
}