"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
class EventEmitter {
    listeners = [];
    on(callback) {
        this.listeners.push(callback);
    }
    off(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    emit(data) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=EventEmitter.js.map