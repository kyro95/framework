import { createEventDecorator, EventType } from '@aurora-mp/core';

export function OnWebView(webviewId: string | number, eventName?: string): MethodDecorator {
    return createEventDecorator(EventType.ON, eventName, webviewId);
}
