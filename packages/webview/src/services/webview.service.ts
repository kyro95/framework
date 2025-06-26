import { WebViewEvents } from '@aurora-mp/core';
import { IWebViewPlatform } from '../interfaces';

export class WebviewService {
    private platform: IWebViewPlatform | null;

    constructor() {
        this.platform = this.getPlatform();
    }

    public on(eventName: string, listener: (...args: any[]) => void): void {
        if (!this.platform) {
            console.warn('[Aurora] The current platform driver does not support on.');
            return;
        }

        this.platform.on(eventName, listener);
    }

    public onServer(eventName: string, listener: (...args: any[]) => void) {
        if (!this.platform) {
            console.warn('[Aurora] The current platform driver does not support onServer.');
            return;
        }

        this.platform.on(eventName, listener);
    }

    public emit(eventName: string, ...args: any[]): void {
        if (!this.platform) {
            console.warn('[Aurora] The current platform driver does not support emit.');
            return;
        }

        this.platform.emit(eventName, ...args);
    }

    public emitServer(eventName: string, ...args: any[]) {
        if (!this.platform) {
            console.warn('[Aurora] The current platform driver does not support emitServer.');
            return;
        }

        this.platform.emitServer(WebViewEvents.EMIT_SERVER, eventName, ...args);
    }

    private getPlatform(): IWebViewPlatform | null {
        // alt:V
        if (typeof window !== 'undefined' && (window as any).alt) {
            const alt = (window as any).alt as {
                on: (event: string, listener: (...args: any[]) => void) => void;
                emit: (event: string, ...args: any[]) => void;
                emitServer: (event: string, ...args: any[]) => void;
            };

            return {
                on: (event, listener) => alt.on(event, listener),
                onServer: (event, listener) => alt.on(event, listener),
                emit: (event, ...args) => alt.emit(event, ...args),
                emitServer: (event, ...args) => alt.emit(event, ...args),
            };
        }

        // RAGE:MP
        if (typeof window !== 'undefined' && (window as any).mp) {
            return {
                on: (event, listener) => (window as any).mp.events.add(event, listener),
                onServer: (event, listener) => (window as any).mp.events.add(event, listener),
                emit: (event, ...args) => (window as any).mp.trigger(event, ...args),
                emitServer: (event, ...args) => (window as any).mp.events.trigger(event, ...args),
            };
        }

        return null;
    }
}
