import { IWebView } from './webview.interface';

/**
 * Defines an abstraction over the underlying multiplayer platform’s
 * event, RPC, and WebView mechanisms. Implement this interface to
 * integrate Aurora with a specific platform driver.
 *
 * @template TPlayer - The native player type provided by the platform
 *   (e.g., server or client player object).
 * @public
 */
export interface IPlatformDriver<TPlayer = unknown> {
    /**
     * Registers a listener for a general platform event.
     *
     * @param eventName - The event identifier (e.g., 'playerConnect', 'resourceStart').
     * @param listener - Called with the raw event arguments when the event fires.
     */
    on(eventName: string, listener: (...args: unknown[]) => void): void;

    /**
     * Unregisters a listener for a general platform event.
     *
     * @param eventName - The event identifier.
     * @param listener - The callback to remove.
     */
    off?(eventName: string, listener: (...args: unknown[]) => void): void;

    /**
     * Registers a listener for a client-originated event.
     *
     * @param eventName - The client event identifier.
     * @param listener - Called with the player instance and event arguments.
     */
    onClient?(eventName: string, listener: (player: TPlayer, ...args: unknown[]) => void): void;

    /**
     * Registers a listener for a server-originated event.
     *
     * @param eventName - The server event identifier.
     * @param listener - Called with the player instance and event arguments.
     */
    onServer?(eventName: string, listener: (player: TPlayer, ...args: unknown[]) => void): void;

    /**
     * Emits a general event to all listeners (server or client).
     *
     * @param eventName - The event identifier to emit.
     * @param args - Arguments to pass to the event handlers.
     */
    emit(eventName: string, ...args: unknown[]): void;

    /**
     * Emits a server-specific event to all server-side listeners.
     *
     * @param eventName - The server event identifier to emit.
     * @param args - Arguments to pass to the server handlers.
     */
    emitServer?(eventName: string, ...args: unknown[]): void;

    /**
     * Emits a client-specific event to a single player.
     *
     * @param player - The target player instance.
     * @param eventName - The client event identifier to emit.
     * @param args - Arguments to pass to the client handler.
     */
    emitClient?(player: TPlayer, eventName: string, ...args: unknown[]): void;

    /**
     * Invokes a server-side RPC and returns its result.
     *
     * @typeParam T - The expected return type of the RPC.
     * @param rpcName - The RPC channel identifier.
     * @param args - Arguments to pass to the RPC handler.
     * @returns A promise resolving with the RPC result.
     */
    invokeServer?<T = any>(rpcName: string, ...args: unknown[]): Promise<T>;

    /**
     * Invokes a client-side RPC on a specific player and returns its result.
     *
     * @typeParam T - The expected return type of the RPC.
     * @param player - The target player instance.
     * @param rpcName - The RPC channel identifier.
     * @param args - Arguments to pass to the RPC handler.
     * @returns A promise resolving with the RPC result.
     */
    invokeClient?<T = any>(player: TPlayer, rpcName: string, ...args: unknown[]): Promise<T>;

    /**
     * Registers a handler for client-initiated RPC calls.
     *
     * @param rpcName - The RPC channel identifier.
     * @param handler - Function to handle incoming RPC requests.
     */
    onRpcClient?(rpcName: string, handler: (...args: unknown[]) => Promise<unknown> | unknown): void;

    /**
     * Registers a handler for server-initiated RPC calls.
     *
     * @param rpcName - The RPC channel identifier.
     * @param handler - Function to handle incoming RPC requests.
     */
    onRpcServer?(rpcName: string, handler: (...args: unknown[]) => Promise<unknown> | unknown): void;

    /**
     * Creates a new WebView instance on the client side.
     *
     * @param id - Unique identifier for the WebView instance.
     * @param url - The URL to load in the WebView.
     * @param focused - Whether the WebView should be focused on creation.
     * @param hidden - Whether the WebView should be hidden initially.
     * @returns A platform‐agnostic {@link IWebView} wrapper.
     */
    createWebview?(id: string | number, url: string, focused: boolean, hidden: boolean): IWebView;

    /**
     * Destroys an existing WebView instance.
     *
     * @param id - The unique identifier of the WebView to destroy.
     */
    destroyWebview?(id: string | number): void;
}
