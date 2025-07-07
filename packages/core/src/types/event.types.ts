import { EventType } from '../enums';
import { Guard, MethodParameter } from '../interfaces';
import { Type } from '../types';

/**
 * Describes a controller method bound to a runtime event, including its type,
 * handler name, parameters to inject, and an optional WebView identifier.
 *
 * @public
 */
export interface EventMetadata {
    /**
     * The type of event this handler listens for (e.g., ON, ON_CLIENT, ON_SERVER).
     */
    type: EventType;

    /**
     * The name of the event, used to match against emitted event names.
     */
    name: string;

    /**
     * The name of the controller method that will be invoked when the event fires.
     */
    methodName: string;

    /**
     * Metadata for each parameter of the handler method, indicating how to resolve
     * its value at runtime (payload, specific property, player, etc.).
     */
    params: MethodParameter[];

    /**
     * Optional identifier for targeting a specific WebView instance when the event
     * originates from a WebView context.
     */
    webViewId?: string | number;

    /**
     * List of Guard classes to run before calling the handler. Each guard
     * must implement the Guard interface and its `canActivate` method.
     */
    guards?: Type<Guard>[];
}
