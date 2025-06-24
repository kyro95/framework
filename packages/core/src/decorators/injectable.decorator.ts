import { Scope } from '../enums';
import { INJECTABLE_METADATA_KEY, INJECTABLE_SCOPE_OPTIONS } from '../constants';
import { InjectableOptions } from '../interfaces';

/**
 * Class decorator that marks a class as injectable into the Aurora DI container.
 * You can optionally specify the provider scope:
 * - `Scope.SINGLETON` (default): one shared instance per application.
 * - `Scope.TRANSIENT`: a new instance for each injection.
 *
 * @param options Optional configuration for this injectable provider.
 * @param options.scope The desired lifetime scope for instances of this class.
 * @throws {Error} If the decorator is applied more than once on the same class.
 * @public
 */
export function Injectable(options?: InjectableOptions): ClassDecorator {
    return (target) => {
        // Prevent multiple @Injectable annotations on the same class
        if (Reflect.hasOwnMetadata(INJECTABLE_METADATA_KEY, target)) {
            throw new Error(`Cannot apply @Injectable decorator multiple times on the same target (${target.name}).`);
        }

        // Mark the class as injectable
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);

        // Store the scope option (default to SINGLETON if not provided)
        Reflect.defineMetadata(INJECTABLE_SCOPE_OPTIONS, options?.scope ?? Scope.SINGLETON, target);
    };
}
