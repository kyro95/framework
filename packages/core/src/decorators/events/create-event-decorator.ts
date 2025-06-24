import { CONTROLLER_EVENTS_KEY } from '../../constants';
import { EventType } from '../../enums';
import { EventMetadata } from '../../types';

/**
 * Factory for creating method decorators that bind controller methods to runtime events.
 *
 * @param type The type of the event (from EventType enum) to listen for.
 * @param name Optional custom event name; defaults to the method name.
 * @param webViewId Optional identifier for targeting a specific WebView instance.
 * @returns A method decorator that registers the decorated method in the controller's event metadata.
 *
 * @throws {Error} If the same method is decorated more than once with an event decorator.
 */
export function createEventDecorator(type: EventType, name?: string, webViewId?: string | number): MethodDecorator {
    return (target: object, methodKey: string | symbol) => {
        const eventName = name ?? (methodKey as string);

        // Retrieve any previously registered events on this controller
        const existingEvents: EventMetadata[] = Reflect.getOwnMetadata(CONTROLLER_EVENTS_KEY, target.constructor) ?? [];

        // Prevent multiple decorators on the same method
        if (existingEvents.some((e) => e.methodName === methodKey)) {
            throw new Error(`Cannot apply multiple event decorators to the same method "${String(methodKey)}".`);
        }

        // Append the new event metadata
        const updatedEvents: EventMetadata[] = [
            ...existingEvents,
            {
                type,
                name: eventName,
                methodName: methodKey as string,
                params: [], // parameters will be populated by @Param decorators
                ...(webViewId !== undefined ? { webViewId } : {}),
            },
        ];

        // Store the updated metadata back on the controller constructor
        Reflect.defineMetadata(CONTROLLER_EVENTS_KEY, updatedEvents, target.constructor);
    };
}
