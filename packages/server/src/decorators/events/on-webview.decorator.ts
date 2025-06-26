import { createEventDecorator, EventType } from '@aurora-mp/core';

/**
 * Binds a server controller method to an event emitted from a specific WebView instance.
 *
 * When applied, the decorated method will be invoked whenever the WebView identified
 * by `webviewId` emits the given event name.
 *
 * @param webviewId  - Identifier of the target WebView (e.g. the numeric or string ID you passed to createWebview).
 * @param eventName  - Optional custom event name emitted by the WebView; if omitted, the method name is used.
 * @returns          - A method decorator that registers the handler under EventType.ON_CLIENT
 *                     (multiplexed via the WebView dispatch channel).
 */
export function OnWebView(webviewId: string | number, eventName?: string): MethodDecorator {
    return createEventDecorator(EventType.ON_CLIENT, eventName, webviewId);
}
