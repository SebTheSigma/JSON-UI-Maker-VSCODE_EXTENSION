type EventCallback<T = any> = (data: T) => void;

export class EventEmitter<T = any> {
    private listeners: EventCallback<T>[] = [];

    on(callback: EventCallback<T>) {
        this.listeners.push(callback);
    }

    off(callback: EventCallback<T>) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    emit(data: T) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}
