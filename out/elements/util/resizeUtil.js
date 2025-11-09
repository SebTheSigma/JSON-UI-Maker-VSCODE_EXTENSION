"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeElementResizable = makeElementResizable;
/**
 * Attach 8-direction resize handles to a positioned element.
 *
 * This utility:
 * - Assumes the element uses absolute or relative positioning with numeric px top/left/width/height.
 * - Adds overlay handles (no external deps, consistent with existing UX).
 * - Avoids interfering with existing drag logic by:
 *   - Only initiating resize when mousedown originates from a handle, not the body of the element.
 *   - Using stopPropagation on handle mousedown.
 */
function makeElementResizable(classInstance, options = {}) {
    const target = classInstance.el;
    const parent = options.parent ??
        target.offsetParent ??
        target.parentElement;
    const minWidth = options.minWidth ?? 20;
    const minHeight = options.minHeight ?? 20;
    if (!parent) {
        // Fallback: allow resize without explicit parent constraints.
        console.warn("[resizeUtil] No parent found for resizable element; using viewport as bounds.");
    }
    const handles = [];
    const handleSize = 8;
    const directions = [
        "n",
        "s",
        "e",
        "w",
        "ne",
        "nw",
        "se",
        "sw",
    ];
    // Ensure target is positioned
    const computed = window.getComputedStyle(target);
    if (computed.position !== "absolute" &&
        computed.position !== "relative" &&
        computed.position !== "fixed") {
        target.style.position = "absolute";
    }
    target.style.boxSizing = target.style.boxSizing || "border-box";
    for (const dir of directions) {
        const handle = document.createElement("div");
        handle.dataset.resizeHandle = dir;
        // Visual/UX consistent minimal style: small square/edge zones.
        handle.style.position = "absolute";
        handle.style.width =
            dir === "n" || dir === "s" ? "100%" : `${handleSize}px`;
        handle.style.height =
            dir === "e" || dir === "w" ? "100%" : `${handleSize}px`;
        handle.style.zIndex = "9999";
        handle.style.background = "transparent";
        handle.style.pointerEvents = "auto";
        // Cursor styles
        switch (dir) {
            case "n":
                handle.style.top = "0";
                handle.style.left = "0";
                handle.style.cursor = "n-resize";
                break;
            case "s":
                handle.style.bottom = "0";
                handle.style.left = "0";
                handle.style.cursor = "s-resize";
                break;
            case "e":
                handle.style.top = "0";
                handle.style.right = "0";
                handle.style.cursor = "e-resize";
                break;
            case "w":
                handle.style.top = "0";
                handle.style.left = "0";
                handle.style.cursor = "w-resize";
                break;
            case "ne":
                handle.style.top = "0";
                handle.style.right = "0";
                handle.style.cursor = "ne-resize";
                break;
            case "nw":
                handle.style.top = "0";
                handle.style.left = "0";
                handle.style.cursor = "nw-resize";
                break;
            case "se":
                handle.style.bottom = "0";
                handle.style.right = "0";
                handle.style.cursor = "se-resize";
                break;
            case "sw":
                handle.style.bottom = "0";
                handle.style.left = "0";
                handle.style.cursor = "sw-resize";
                break;
        }
        // Attach mousedown for resize start
        handle.addEventListener("mousedown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            startResize(event, dir);
        });
        target.appendChild(handle);
        handles.push({ dir, el: handle });
    }
    let isResizing = false;
    let currentDir = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startLeft = 0;
    let startTop = 0;
    const onMouseMove = (event) => {
        if (!isResizing || !currentDir)
            return;
        const parentRect = parent?.getBoundingClientRect() ??
            new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        if (currentDir.includes("e")) {
            newWidth = clamp(startWidth + dx, minWidth, parentRect.width - (startLeft - parentRect.left));
        }
        if (currentDir.includes("s")) {
            newHeight = clamp(startHeight + dy, minHeight, parentRect.height - (startTop - parentRect.top));
        }
        if (currentDir.includes("w")) {
            const maxDeltaLeft = startWidth - minWidth;
            const pxFromParentLeft = startLeft - parentRect.left;
            const minLeftWithinParent = parentRect.left;
            let proposedLeft = startLeft + dx;
            const constrainedLeft = Math.max(minLeftWithinParent, Math.min(startLeft + maxDeltaLeft, proposedLeft));
            const appliedDx = constrainedLeft - startLeft;
            newLeft = constrainedLeft;
            newWidth = startWidth - appliedDx;
        }
        if (currentDir.includes("n")) {
            const maxDeltaTop = startHeight - minHeight;
            const pxFromParentTop = startTop - parentRect.top;
            const minTopWithinParent = parentRect.top;
            let proposedTop = startTop + dy;
            const constrainedTop = Math.max(minTopWithinParent, Math.min(startTop + maxDeltaTop, proposedTop));
            const appliedDy = constrainedTop - startTop;
            newTop = constrainedTop;
            newHeight = startHeight - appliedDy;
        }
        const parentLeft = parentRect.left;
        const parentTop = parentRect.top;
        const offsetLeft = newLeft - parentLeft;
        const offsetTop = newTop - parentTop;
        target.style.width = `${newWidth}px`;
        target.style.height = `${newHeight}px`;
        target.style.left = `${offsetLeft}px`;
        target.style.top = `${offsetTop}px`;
        if (options.onResize) {
            const rect = target.getBoundingClientRect();
            options.onResize(rect, target.style);
        }
    };
    const onMouseUp = () => {
        if (!isResizing)
            return;
        isResizing = false;
        currentDir = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
    function startResize(event, dir) {
        const rect = target.getBoundingClientRect();
        const parentRect = parent?.getBoundingClientRect() ??
            new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        isResizing = true;
        currentDir = dir;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    // Return cleanup function for callers if they need to remove handles/listeners.
    return () => {
        handles.forEach((h) => {
            if (h.el.parentElement === target) {
                target.removeChild(h.el);
            }
        });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
}
//# sourceMappingURL=resizeUtil.js.map