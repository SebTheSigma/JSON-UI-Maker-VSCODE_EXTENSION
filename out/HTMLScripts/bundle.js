"use strict";
var App = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // HTMLScripts/mainScript.ts
  var mainScript_exports = {};
  __export(mainScript_exports, {
    WEB_SIDE_GLOBAL_ELEMENT_ID_MAP: () => WEB_SIDE_GLOBAL_ELEMENT_ID_MAP,
    container: () => container,
    vscode: () => vscode
  });

  // src/elements/util/resizeUtil.ts
  function makeElementResizable(target, options = {}) {
    console.log("makeElementResizable called on:", target);
    const parent = options.parent ?? target.offsetParent ?? target.parentElement;
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
      "se"
    ];
    const computed = window.getComputedStyle(target);
    if (computed.position !== "absolute" && computed.position !== "relative" && computed.position !== "fixed") {
      target.style.position = "absolute";
    }
    target.style.boxSizing = target.style.boxSizing || "border-box";
    for (const dir of directions) {
      const handle = document.createElement("div");
      handle.dataset.resizeHandle = dir;
      handle.style.position = "absolute";
      handle.style.zIndex = "99999";
      handle.style.background = "transparent";
      handle.style.pointerEvents = "auto";
      handle.style.userSelect = "none";
      switch (dir) {
        case "n":
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
      const parentHeight = parent ? parent.clientHeight : Number.POSITIVE_INFINITY;
      const hasEast = currentDir.includes("e");
      const hasWest = currentDir.includes("w");
      const hasNorth = currentDir.includes("n");
      const hasSouth = currentDir.includes("s");
      if (hasEast && !hasWest) {
        let newWidth = startWidth + dx;
        if (parent) {
          newWidth = Math.min(newWidth, parentWidth - startLeft);
        }
        newWidth = Math.max(minWidth, newWidth);
        target.style.width = `${newWidth}px`;
      } else if (hasWest && !hasEast) {
        let newLeft = startLeft + dx;
        let newWidth = startWidth - dx;
        if (parent && newLeft < 0) {
          newLeft = 0;
          newWidth = startLeft + startWidth;
        }
        if (newWidth < minWidth) {
          newWidth = minWidth;
          newLeft = startLeft + startWidth - minWidth;
        }
        target.style.left = `${newLeft}px`;
        target.style.width = `${newWidth}px`;
      } else if (hasEast && hasWest) {
        let newWidth = startWidth + dx;
        if (parent) {
          newWidth = Math.min(newWidth, parentWidth - startLeft);
        }
        newWidth = Math.max(minWidth, newWidth);
        target.style.width = `${newWidth}px`;
      }
      if (hasSouth && !hasNorth) {
        let newHeight = startHeight + dy;
        if (parent) {
          newHeight = Math.min(newHeight, parentHeight - startTop);
        }
        newHeight = Math.max(minHeight, newHeight);
        target.style.height = `${newHeight}px`;
      } else if (hasNorth && !hasSouth) {
        let newTop = startTop + dy;
        let newHeight = startHeight - dy;
        if (parent && newTop < 0) {
          newTop = 0;
          newHeight = startTop + startHeight;
        }
        if (newHeight < minHeight) {
          newHeight = minHeight;
          newTop = startTop + startHeight - minHeight;
        }
        target.style.top = `${newTop}px`;
        target.style.height = `${newHeight}px`;
      } else if (hasSouth && hasNorth) {
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
      startLeft = parseFloat(target.style.left) || 0;
      startTop = parseFloat(target.style.top) || 0;
      startWidth = target.offsetWidth;
      startHeight = target.offsetHeight;
      console.log("Start resize:", {
        dir,
        startLeft,
        startTop,
        startWidth,
        startHeight
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

  // HTMLScripts/panel.ts
  var Panel = class {
    constructor(data, parentId) {
      __publicField(this, "data");
      __publicField(this, "parentId");
      __publicField(this, "el");
      __publicField(this, "parent");
      __publicField(this, "isDragging", false);
      __publicField(this, "initialX", 0);
      __publicField(this, "initialY", 0);
      __publicField(this, "parentRect");
      __publicField(this, "cleanupResize", null);
      __publicField(this, "onMouseMove", (event) => this.drag(event));
      __publicField(this, "onMouseUp", () => this.stopDrag());
      this.data = data;
      this.parentId = parentId;
      this.parent = document.querySelector(`[data-id="${parentId}"]`) ?? container;
      this.parentRect = this.parent.getBoundingClientRect();
      this.el = document.createElement("div");
      this.el.style.position = "absolute";
      const parentWidth = Number(this.parent?.style.width.replace(/[A-Za-z]/g, "")) || this.parentRect.width;
      const parentHeight = Number(this.parent?.style.height.replace(/[A-Za-z]/g, "")) || this.parentRect.height;
      this.el.style.zIndex = `${Number(this.parent.style.zIndex) + 1}`;
      this.el.style.width = `${parentWidth * 0.8}px`;
      this.el.style.height = `${parentHeight * 0.8}px`;
      this.el.style.left = `${parentWidth * 0.1}px`;
      this.el.style.top = `${parentHeight * 0.1}px`;
      this.init();
      this.parent.appendChild(this.el);
      WEB_SIDE_GLOBAL_ELEMENT_ID_MAP.set(this.data.dataset.id, this);
    }
    init() {
      this.asignData();
      this.selectionSystem();
      this.el.addEventListener("mousedown", (event) => {
        this.startDrag(event);
      });
      this.cleanupResize = makeElementResizable(this.el, {
        parent: this.parent,
        minWidth: 40,
        minHeight: 40
      });
    }
    asignData() {
      for (const [key, value] of Object.entries(this.data.style || {})) {
        this.el.style[key] = value;
      }
      for (const [key, value] of Object.entries(this.data.dataset || {})) {
        this.el.dataset[key] = value;
      }
      for (let key of Object.keys(this.data)) {
        if (key === "style" || key === "dataset") {
          continue;
        }
        this.el[key] = this.data[key];
      }
    }
    selectionSystem() {
      this.el.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("Double clicked");
        if (this.el.classList.contains("selected")) {
          this.el.classList.remove("selected");
          vscode.postMessage({
            type: "element_selection_change",
            id: this.data.dataset.id,
            selected: false
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
          selected: true
        });
      });
    }
    startDrag(event) {
      const target = event.target;
      if (target && target.dataset && target.dataset.resizeHandle) {
        return;
      }
      if (!this.el.contains(event.target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.parentRect = this.parent.getBoundingClientRect();
      const rect = this.el.getBoundingClientRect();
      this.isDragging = true;
      this.initialX = event.clientX - rect.left;
      this.initialY = event.clientY - rect.top;
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    }
    stopDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
    drag(event) {
      if (!this.isDragging) {
        return;
      }
      const deltaX = event.clientX - this.parentRect.left - this.initialX;
      const deltaY = event.clientY - this.parentRect.top - this.initialY;
      this.el.style.left = `${deltaX}px`;
      this.el.style.top = `${deltaY}px`;
    }
    delete() {
      if (this.el.classList.contains("selected")) {
        vscode.postMessage({
          type: "element_selection_change",
          id: this.data.dataset.id,
          selected: false
        });
      }
      if (this.cleanupResize) {
        this.cleanupResize();
        this.cleanupResize = null;
      }
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
      if (this.el.parentElement === this.parent) {
        this.parent.removeChild(this.el);
      }
    }
  };

  // HTMLScripts/mainScript.ts
  var vscode = acquireVsCodeApi();
  var container = document.getElementById("container");
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "add_element") {
      const data = msg.data;
      const parentId = msg.parentId;
      switch (data.class) {
        case "panel": {
          const panel = new Panel(data, parentId);
          break;
        }
        default: {
          const parent = parentId && document.querySelector(
            `[data-id="${parentId}"]`
          ) || container;
          const el = document.querySelector(
            `[data-id="${data.dataset?.id}"]`
          );
          if (el) {
            makeElementResizable(el, {
              parent,
              minWidth: 20,
              minHeight: 20
            });
          }
          break;
        }
      }
    } else if (msg.type === "delete_element") {
      const elementId = msg.dataID;
      const element = document.querySelector(
        `[data-id="${elementId}"]`
      );
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
      const element = document.querySelector(
        `[data-id="${elementID}"]`
      );
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
          zIndex: Number(element.style.zIndex)
        },
        text: element.textContent || ""
      };
      console.warn("MESSAGE POSTING", elementData);
      vscode.postMessage({
        type: "element",
        from: msg.from,
        element: elementData
      });
      console.warn("MESSAGE POSTED");
    }
  });
  var buttons = ["add_panel", "delete_selected"];
  for (const button of buttons) {
    const buttonElement = document.getElementById(button);
    buttonElement.addEventListener("click", () => {
      vscode.postMessage({
        type: "button_clicked",
        id: button
      });
    });
  }
  var WEB_SIDE_GLOBAL_ELEMENT_ID_MAP = /* @__PURE__ */ new Map();
  var lastWidth = window.innerWidth;
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
    lastWidth = newWidth;
    console.log("Resized", scale);
    const elements = document.querySelectorAll('[data-id][data-resize-scale="true"]');
    elements.forEach((el) => {
      const style = el.style;
      const left = Number(style.left.replace(/[A-Za-z]/g, ""));
      const top = Number(style.top.replace(/[A-Za-z]/g, ""));
      const width = Number(style.width.replace(/[A-Za-z]/g, ""));
      const height = Number(style.height.replace(/[A-Za-z]/g, ""));
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
  return __toCommonJS(mainScript_exports);
})();
//# sourceMappingURL=bundle.js.map
