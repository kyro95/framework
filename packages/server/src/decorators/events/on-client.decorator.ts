import { createEventDecorator, EventType } from '@aurora-mp/core';

/**
 * Binds a server controller method to a client-originating event.
 *
 * When applied, the decorated method will be invoked whenever the specified
 * event is emitted from the client side.
 *
 * @typeParam E - Literal type of the event name.
 * @param eventName - Optional custom event name; if omitted, the method name is used.
 * @returns A method decorator that registers the handler under EventType.ON_CLIENT.
 */
export function OnClient<E extends string>(eventName?: E): MethodDecorator {
    return createEventDecorator(EventType.ON_CLIENT, eventName);
}
