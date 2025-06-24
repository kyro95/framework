import { CONTROLLER_METADATA_KEY } from '../constants';

/**
 * Class decorator that marks a class as a controller within the Aurora framework.
 * Controllers will be scanned and instantiated by the ApplicationFactory,
 * and their decorated event-handler methods will be bound to the platform driver.
 *
 * @throws {Error} if applied more than once on the same class.
 * @public
 */
export function Controller(): ClassDecorator {
    return (target) => {
        // Prevent multiple @Controller annotations on the same class
        if (Reflect.hasOwnMetadata(CONTROLLER_METADATA_KEY, target)) {
            throw new Error(`Cannot apply @Controller decorator multiple times on the same target (${target.name}).`);
        }

        // Define a flag metadata to mark this class as a controller
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, true, target);
    };
}
