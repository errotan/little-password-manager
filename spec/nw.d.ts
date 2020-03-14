import { EventEmitter } from 'events';

export interface NwWindow extends EventEmitter {
  resizeTo(w: number, h: number): void;
  setPosition(s: string): void;
  maximize(): void;
}

export interface NwClipboard {
  set(data: string): void;
}
