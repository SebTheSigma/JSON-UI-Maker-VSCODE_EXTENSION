"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeElementResizable = makeElementResizable;
function makeElementResizable(target, options = {}) {
    console.log("makeElementResizable called on:", target);
    const parent = options.parent ??
        target.offsetParent ??
        target.parentElement;
    const minWidth = options.minWidth ?? 20;
    const minHeight = options.minHeight ?? 20;
    const handles = [];
    const handleSize = 8;
    const directions = [
        "nw",
        "n",
        "ne",
        "w",
        "e",
        "sw",
        "s",
        "se",
    ];
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
        handle.style.position = "absolute";
        handle.style.zIndex = "99999";
        handle.style.background = "transparent"; // Invisible but hit-testable
        handle.style.pointerEvents = "auto";
        handle.style.userSelect = "none";
        switch (dir) {
            case "n":
                // Slightly inset from extreme corners so corners can remain dedicated to diagonal-resize.
                handle.style.top = "0";
                handle.style.left = `${handleSize}px`;
                handle.style.right = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "n-resize";
                break;
            case "s":
                handle.style.bottom = "0";
                handle.style.left = `${handleSize}px`;
                handle.style.right = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "s-resize";
                break;
            case "e":
                handle.style.right = "0";
                handle.style.top = `${handleSize}px`;
                handle.style.bottom = `${handleSize}px`;
                handle.style.width = `${handleSize}px`;
                handle.style.cursor = "e-resize";
                break;
            case "w":
                handle.style.left = "0";
                handle.style.top = `${handleSize}px`;
                handle.style.bottom = `${handleSize}px`;
                handle.style.width = `${handleSize}px`;
                handle.style.cursor = "w-resize";
                break;
            case "ne":
                handle.style.top = "0";
                handle.style.right = "0";
                handle.style.width = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "ne-resize";
                // Ensure corner has precedence over adjacent edges by being fully in the corner.
                break;
            case "nw":
                handle.style.top = "0";
                handle.style.left = "0";
                handle.style.width = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "nw-resize";
                break;
            case "se":
                handle.style.bottom = "0";
                handle.style.right = "0";
                handle.style.width = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "se-resize";
                break;
            case "sw":
                handle.style.bottom = "0";
                handle.style.left = "0";
                handle.style.width = `${handleSize}px`;
                handle.style.height = `${handleSize}px`;
                handle.style.cursor = "sw-resize";
                break;
        }
        // IMPORTANT:
        // Attach mousedown directly on the handle in bubble phase so panel-level
        // listeners see event.target as this handle (with data-resize-handle),
        // allowing them to skip drag. We still stopPropagation to avoid any
        // outer listeners from misinterpreting this as a drag start.
        handle.addEventListener("mousedown", (event) => {
            console.log("Handle mousedown:", dir);
            event.preventDefault();
            event.stopPropagation();
            startResize(event, dir);
        });
        target.appendChild(handle);
        handles.push({ dir, el: handle });
        console.log("Created handle:", dir, handle);
    }
    console.log("Total handles created:", handles.length);
    let isResizing = false;
    let currentDir = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startLeft = 0;
    let startTop = 0;
    const onMouseMove = (event) => {
        if (!isResizing || !currentDir) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const parentWidth = parent ? parent.clientWidth : Number.POSITIVE_INFINITY;
        const parentHeight = parent
            ? parent.clientHeight
            : Number.POSITIVE_INFINITY;
        const hasEast = currentDir.includes("e");
        const hasWest = currentDir.includes("w");
        const hasNorth = currentDir.includes("n");
        const hasSouth = currentDir.includes("s");
        // Horizontal resizing
        if (hasEast && !hasWest) {
            // Dragging right edge: only change width, keep left fixed.
            let newWidth = startWidth + dx;
            if (parent) {
                newWidth = Math.min(newWidth, parentWidth - startLeft);
            }
            newWidth = Math.max(minWidth, newWidth);
            target.style.width = `${newWidth}px`;
        }
        else if (hasWest && !hasEast) {
            // Dragging left edge: adjust left and width so right edge stays anchored.
            let newLeft = startLeft + dx;
            let newWidth = startWidth - dx;
            if (parent && newLeft < 0) {
                newLeft = 0;
                newWidth = startLeft + startWidth;
            }
            // Clamp width to minimum and adjust left to keep right edge anchored
            if (newWidth < minWidth) {
                newWidth = minWidth;
                newLeft = startLeft + startWidth - minWidth;
            }
            target.style.left = `${newLeft}px`;
            target.style.width = `${newWidth}px`;
        }
        else if (hasEast && hasWest) {
            // Corner cases including both east and west should effectively behave as east+west,
            // but to avoid conflicting logic, prefer treating them as east anchored (no horizontal shift).
            let newWidth = startWidth + dx;
            if (parent) {
                newWidth = Math.min(newWidth, parentWidth - startLeft);
            }
            newWidth = Math.max(minWidth, newWidth);
            target.style.width = `${newWidth}px`;
        }
        // Vertical resizing
        if (hasSouth && !hasNorth) {
            // Dragging bottom edge: only change height, keep top fixed.
            let newHeight = startHeight + dy;
            if (parent) {
                newHeight = Math.min(newHeight, parentHeight - startTop);
            }
            newHeight = Math.max(minHeight, newHeight);
            target.style.height = `${newHeight}px`;
        }
        else if (hasNorth && !hasSouth) {
            // Dragging top edge: adjust top and height so bottom edge stays anchored.
            let newTop = startTop + dy;
            let newHeight = startHeight - dy;
            if (parent && newTop < 0) {
                newTop = 0;
                newHeight = startTop + startHeight;
            }
            // Clamp height to minimum and adjust top to keep bottom edge anchored
            if (newHeight < minHeight) {
                newHeight = minHeight;
                newTop = startTop + startHeight - minHeight;
            }
            target.style.top = `${newTop}px`;
            target.style.height = `${newHeight}px`;
        }
        else if (hasSouth && hasNorth) {
            // Corner with both north and south; prefer treating as south anchored (no vertical shift).
            let newHeight = startHeight + dy;
            if (parent) {
                newHeight = Math.min(newHeight, parentHeight - startTop);
            }
            newHeight = Math.max(minHeight, newHeight);
            target.style.height = `${newHeight}px`;
        }
        if (options.onResize) {
            const rect = target.getBoundingClientRect();
            options.onResize(rect, target.style);
        }
    };
    const onMouseUp = (event) => {
        if (!isResizing) {
            return;
        }
        console.log("Resize ended");
        event.preventDefault();
        event.stopPropagation();
        isResizing = false;
        currentDir = null;
        document.removeEventListener("mousemove", onMouseMove, true);
        document.removeEventListener("mouseup", onMouseUp, true);
    };
    function startResize(event, dir) {
        console.log("startResize called:", dir);
        isResizing = true;
        currentDir = dir;
        startX = event.clientX;
        startY = event.clientY;
        // Use the element's current style values to avoid coordinate space mismatch
        startLeft = parseFloat(target.style.left) || 0;
        startTop = parseFloat(target.style.top) || 0;
        startWidth = target.offsetWidth;
        startHeight = target.offsetHeight;
        console.log("Start resize:", {
            dir,
            startLeft,
            startTop,
            startWidth,
            startHeight,
        });
        document.addEventListener("mousemove", onMouseMove, true);
        document.addEventListener("mouseup", onMouseUp, true);
    }
    return () => {
        console.log("Cleanup resize handles");
        handles.forEach((h) => {
            if (h.el.parentElement === target) {
                target.removeChild(h.el);
            }
        });
        document.removeEventListener("mousemove", onMouseMove, true);
        document.removeEventListener("mouseup", onMouseUp, true);
    };
}
//# sourceMappingURL=resizeUtil.js.map