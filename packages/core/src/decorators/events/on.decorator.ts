import { EventType } from '../../enums';
import { createEventDecorator } from './create-event-decorator';

/**
 * Method decorator that binds a controller method to the `ON` event type.
 *
 * @param eventName Optional custom event name; if omitted, the method name will be used.
 * @returns A method decorator that registers the decorated method as an event handler
 *          for `EventType.ON` in the controller’s metadata.
 *
 * @example
 * ```ts
 * @Controller()
 * class MyController {
 *   @On('playerJoined')
 *   handlePlayerJoin(data: PlayerData) {
 *     // ...handle player join...
 *   }
 * }
 * ```
 * @public
 */
export function On(eventName?: string) {
    return createEventDecorator(EventType.ON, eventName);
}
