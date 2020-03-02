interface EventEmitter {
}

interface Getter {
    get(): EventEmitter;
}

declare namespace nw {
    const Window: Getter;
    const Clipboard: Getter;
}
