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
      document.addEventListener("mouseup", () => {
        this.stopDrag();
      });
      document.addEventListener("mousemove", (event) => {
        this.drag(event);
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
      event.preventDefault();
      event.stopPropagation();
      this.parentRect = this.parent.getBoundingClientRect();
      const rect = this.el.getBoundingClientRect();
      this.isDragging = true;
      this.initialX = event.clientX - rect.left;
      this.initialY = event.clientY - rect.top;
    }
    stopDrag() {
      this.isDragging = false;
    }
    drag(event) {
      if (this.isDragging) {
        const deltaX = event.clientX - this.parentRect.left - this.initialX;
        const deltaY = event.clientY - this.parentRect.top - this.initialY;
        this.el.style.left = `${deltaX}px`;
        this.el.style.top = `${deltaY}px`;
        console.log(event.clientX, event.clientY);
      }
    }
    delete() {
      if (this.el.classList.contains("selected")) {
        vscode.postMessage({
          type: "element_selection_change",
          id: this.data.dataset.id,
          selected: false
        });
      }
      this.parent.removeChild(this.el);
      document.removeEventListener("mouseup", () => {
        this.stopDrag();
      });
      document.removeEventListener("mousemove", (event) => {
        this.drag(event);
      });
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
        case "panel":
          new Panel(data, parentId);
          break;
      }
    } else if (msg.type === "delete_element") {
      const elementId = msg.dataID;
      const element = document.querySelector(`[data-id="${elementId}"]`);
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
      const element = document.querySelector(`[data-id="${elementID}"]`);
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
    const scale = window.innerWidth / lastWidth;
    lastWidth = window.innerWidth;
    console.log("Resized", scale);
    const elements = document.querySelectorAll("[data-id]");
    elements.forEach((el) => {
      const style = el.style;
      style.left = `${Number(style.left.replace(/[A-Za-z]/g, "")) * scale}px`;
      style.top = `${Number(style.top.replace(/[A-Za-z]/g, "")) * scale}px`;
      style.width = `${Number(style.width.replace(/[A-Za-z]/g, "")) * scale}px`;
      style.height = `${Number(style.height.replace(/[A-Za-z]/g, "")) * scale}px`;
    });
  });
  return __toCommonJS(mainScript_exports);
})();
//# sourceMappingURL=bundle.js.map
