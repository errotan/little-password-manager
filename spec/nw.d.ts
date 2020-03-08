import { EventEmitter } from "events";

interface NwWindow extends EventEmitter {
    resizeTo(w: number, h: number): void;
    setPosition(s: string): void;
    maximize(): void;
}

interface NwWindowGetter {
    get(): NwWindow;
}

interface NwClipboard {
    set(data: string): void;
}

interface NwClipboardGetter {
    get(): NwClipboard;
}

declare namespace nw {
    const Window: NwWindowGetter;
    const Clipboard: NwClipboardGetter;
}
