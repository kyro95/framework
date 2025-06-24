/**
 * Minimal cross-platform abstraction for a browser-based UI instance.
 * Mirrors common APIs for alt:V, RageMP, etc.
 */
export interface IWebView {
    readonly id: string | number;

    on(eventName: string, listener: (...args: unknown[]) => void): void;
    emit(eventName: string, ...args: unknown[]): void;

    //destroy(): void;
    //focus?(): void;
    //unfocus?(): void;
}

/*export interface IWebView {
    readonly id: string | number;
    url: string;

    destroy(): void;

    on(eventName: string, listener: (...args: any[]) => void): void;
    emit(eventName: string, ...args: any[]): void;

    focus(): void;
    unfocus(): void;

    //id: string | number;
    // on(event: string, listener: (...args: unknown[]) => void): void;
    //on(eventName: string, listener: (...args: unknown[]) => void): void;
    //emit(event: string, ...args: unknown[]): void;
    destroy(): void;
}*/
