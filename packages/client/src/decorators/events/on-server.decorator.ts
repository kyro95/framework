import { createEventDecorator, EventType } from '@aurora-mp/core';

export function OnServer<E extends string>(eventName?: E): MethodDecorator {
    return createEventDecorator(EventType.ON_SERVER, eventName);
}
