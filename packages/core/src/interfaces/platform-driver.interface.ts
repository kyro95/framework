import { IWebView } from './webview.interface';

/**
 * Abstraction over the underlying platform’s event and WebView APIs.
 * Implement this interface to integrate Aurora with a specific multiplayer platform.
 *
 * @typeParam TPlayer The native player type provided by the platform (e.g., server or client player object).
 * @public
 */
export interface IPlatformDriver<TPlayer = unknown> {
    /**
     * Subscribes to a general platform event (server-side or client-side).
     *
     * @param eventName The name of the event (e.g., 'playerConnect', 'resourceStart').
     * @param listener Callback invoked when the event fires; receives the raw event arguments.
     */
    on(eventName: string, listener: (...args: unknown[]) => void): void;

    /**
     * Subscribes to a client-originated event.
     *
     * @param eventName The name of the client event.
     * @param listener Callback invoked with the player instance and event arguments.
     */
    onClient?(eventName: string, listener: (player: TPlayer, ...args: unknown[]) => void): void;

    /**
     * Subscribes to a server-originated event.
     *
     * @param eventName The name of the server event.
     * @param listener Callback invoked with the player instance and event arguments.
     */
    onServer?(eventName: string, listener: (player: TPlayer, ...args: unknown[]) => void): void;

    /**
     * Emits a general event to all listeners (server or client).
     *
     * @param eventName The name of the event to emit.
     * @param args Arguments to pass along to event listeners.
     */
    emit(eventName: string, ...args: unknown[]): void;

    /**
     * Emits a server-specific event.
     *
     * @param eventName The name of the server event to emit.
     * @param args Arguments to pass along to server-side listeners.
     */
    emitServer?(eventName: string, ...args: unknown[]): void;

    /**
     * Emits a client-specific event to a single player.
     *
     * @param player The native player object to target.
     * @param eventName The name of the client event to emit.
     * @param args Arguments to pass along to the client listener.
     */
    emitClient?(player: TPlayer, eventName: string, ...args: unknown[]): void;

    /**
     * Creates a new WebView instance on the client side.
     *
     * @param id Unique identifier for this WebView instance.
     * @param url The URL to load in the WebView.
     * @returns An {@link IWebView} wrapper around the platform-specific WebView.
     */
    createWebview?(id: string | number, url: string, focused: boolean, hidden: boolean): IWebView;

    /**
     * Destroys an existing WebView instance.
     *
     * @param id The unique identifier of the WebView to destroy.
     */
    destroyWebview?(id: string | number): void;
}
