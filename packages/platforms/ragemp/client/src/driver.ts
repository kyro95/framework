import { IPlatformDriver, IWebView, WebViewEvents } from '@aurora-mp/core';

class RageWebViewWrapper implements IWebView {
    constructor(
        public readonly id: string | number,
        private webview: BrowserMp,
    ) {}

    public on(_event: string, _listener: (...args: unknown[]) => void): void {
        // TODO
    }

    public emit(event: string, ...args: unknown[]): void {
        this.webview.call(event, ...args);
    }

    public destroy(): void {
        this.webview.destroy();
    }
}

/**
 * Implements the IPlatformDriver interface using the RAGE Multiplayer client-side API.
 */
export class RageClientDriver implements IPlatformDriver {
    private webviews = new Map<string | number, RageWebViewWrapper>();

    constructor() {
        // Received event from (cef -> client -> server)
        mp.events.add(WebViewEvents.EMIT_SERVER, (eventName: string, ...args: unknown[]) => {
            mp.events.callRemote(eventName, ...args);
        });

        // Send event from server (server -> client -> cef)
        mp.events.add(WebViewEvents.DISPATCH, (...args: unknown[]) => {
            const [id, eventName, ...rest] = args as [string | number, string, ...unknown[]];
            const webview = this.webviews.get(id);
            if (!webview) return;

            webview.emit(eventName, ...rest);
        });
    }

    public createWebview(
        id: string | number,
        url: string,
        focused: boolean = false,
        hidden: boolean = false,
    ): IWebView {
        const webview = mp.browsers.new(url);
        const handle = new RageWebViewWrapper(id, webview);

        this.webviews.set(id, handle);

        if (focused) {
            mp.gui.cursor.visible = true;
            mp.gui.cursor.show(true, true);
        }

        if (hidden) {
            webview.active = !hidden;
        }

        return handle;
    }

    /**
     * Subscribes to a global client-side event.
     */
    public on(eventName: string, listener: (...args: any[]) => void): void {
        mp.events.add(eventName, listener);
    }

    /**
     * Subscribes to a global client-side event.
     */
    public onServer(eventName: string, listener: (...args: any[]) => void): void {
        mp.events.add(eventName, listener);
    }

    /**
     * Emits a global client-side event.
     */
    public emit(eventName: string, ...args: any[]): void {
        mp.events.call(eventName, ...args);
    }

    // TODO: Check if we can pass an object as an argument (to make { hello: 'world' } (typescript type))
    public emitServer(eventName: string, ...args: any[]): void {
        mp.events.callRemote(eventName, ...args);
    }
}
