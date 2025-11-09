import { container, WEB_SIDE_GLOBAL_ELEMENT_ID_MAP, vscode } from "./mainScript.js";
import { makeElementResizable } from "../src/elements/util/resizeUtil.js";

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

    private readonly onMouseMove: (event: MouseEvent) => void = (event) => this.drag(event);
    private readonly onMouseUp: (event: MouseEvent) => void = () => this.stopDrag();

    public init() {
        this.asignData();
        this.selectionSystem();

        // Start drag only from this element body, not from resize handles.
        this.el.addEventListener("mousedown", (event: MouseEvent) => {
            this.startDrag(event);
        });

        // DON'T add document listeners here! Only add them when actually dragging

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
        // Ignore drags originating from resize handles to avoid conflict.
        const target = event.target as HTMLElement | null;
        if (target && target.dataset && target.dataset.resizeHandle) {
            return;
        }

        // Only start dragging if the mousedown is on this panel element or its non-handle children.
        if (!this.el.contains(event.target as Node)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.parentRect = this.parent.getBoundingClientRect();
        const rect = this.el.getBoundingClientRect();

        this.isDragging = true;
        this.initialX = event.clientX - rect.left;
        this.initialY = event.clientY - rect.top;

        // ADD document listeners ONLY when we start dragging
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
    }

    public stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;

        // REMOVE document listeners when we stop dragging
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
    }

    public drag(event: MouseEvent) {
        // Only move this panel when its own drag is active.
        if (!this.isDragging) {
            return;
        }

        const deltaX = event.clientX - this.parentRect.left - this.initialX;
        const deltaY = event.clientY - this.parentRect.top - this.initialY;

        this.el.style.left = `${deltaX}px`;
        this.el.style.top = `${deltaY}px`;
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

        // Make sure to remove any lingering listeners
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);

        if (this.el.parentElement === this.parent) {
            this.parent.removeChild(this.el);
        }
    }
}