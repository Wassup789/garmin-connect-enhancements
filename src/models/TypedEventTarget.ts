import { LitElement } from "lit";

export type TypedEventTarget<T, EventMap> = { new (): BaseTypedEventTargetImpl<T, EventMap> };
export type TypedLitElement<T, EventMap> = { new (): BaseTypedLitElementImpl<T, EventMap> };

interface BaseTypedEventTargetImpl<T, EventMap> extends EventTarget {
    addEventListener<U extends keyof EventMap>(type: U, listener: (this: T, ev: EventMap[U]) => unknown, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<U extends keyof EventMap>(type: U, listener: (this: T, ev: EventMap[U]) => unknown, options?: boolean | EventListenerOptions): void;

    addEventListener<U extends keyof WindowEventMap>(type: U, listener: (this: T, ev: WindowEventMap[U]) => unknown, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<U extends keyof WindowEventMap>(type: U, listener: (this: T, ev: WindowEventMap[U]) => never, options?: boolean | EventListenerOptions): void;
}

// @ts-expect-error Ignore, assume T extends LitElement. If implemented correctly, the type casting should be against a LitElement
interface BaseTypedLitElementImpl<T, EventMap> extends LitElement {
    addEventListener<U extends keyof EventMap>(type: U, listener: (this: T, ev: EventMap[U]) => unknown, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<U extends keyof EventMap>(type: U, listener: (this: T, ev: EventMap[U]) => unknown, options?: boolean | EventListenerOptions): void;

    addEventListener<U extends keyof HTMLElementEventMap>(type: U, listener: (this: T, ev: HTMLElementEventMap[U]) => unknown, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<U extends keyof HTMLElementEventMap>(type: U, listener: (this: T, ev: HTMLElementEventMap[U]) => never, options?: boolean | EventListenerOptions): void;
}
