export interface IWebViewPlatform {
    on(eventName: string, listener: (...args: any[]) => void): void;
    onServer(eventName: string, listener: (...args: any[]) => void): void;
    emit(eventName: string, ...args: any[]): void;
    emitServer(eventName: string, ...args: any[]): void;
}
