/**
 * Minimal cross-platform abstraction for a browser-based UI instance.
 * Mirrors common APIs for alt:V, RageMP, etc.
 */
export interface IWebView {
    readonly id: string | number;

    on(eventName: string, listener: (...args: unknown[]) => void): void;
    emit(eventName: string, ...args: unknown[]): void;

    // ToDo
    //destroy(): void;
    //focus?(): void;
    //unfocus?(): void;
}
