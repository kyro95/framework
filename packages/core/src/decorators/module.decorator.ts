import { MODULE_METADATA_KEY } from '../constants';
import { ModuleMetadata } from '../types';

const VALID_MODULE_KEYS: (keyof ModuleMetadata)[] = ['imports', 'controllers', 'providers', 'exports'];

/**
 * Class decorator that designates a class as a module in the Aurora framework.
 * A module groups related controllers, providers, and imported/exported modules
 * into a cohesive unit for dependency scanning and resolution.
 *
 * @param metadata Configuration object defining:
 *  - `imports`: other modules whose providers/controllers should be available
 *  - `controllers`: controller classes to instantiate and bind
 *  - `providers`: service classes or tokens to register in the DI container
 *  - `exports`: subset of providers/controllers to expose to importing modules
 *
 * @throws {Error}
 *  - If applied more than once to the same class.
 *  - If the metadata contains keys outside of the allowed set (`imports`, `controllers`, `providers`, `exports`).
 * @public
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
    return (target) => {
        // Prevent multiple @Module annotations on the same class
        if (Reflect.hasOwnMetadata(MODULE_METADATA_KEY, target)) {
            throw new Error(`Cannot apply @Module decorator multiple times on the same target (${target.name}).`);
        }

        // Validate metadata keys
        for (const key in metadata) {
            if (!VALID_MODULE_KEYS.includes(key as keyof ModuleMetadata)) {
                throw new Error(`Invalid property '${key}' passed into the @Module metadata in ${target.name}.`);
            }
        }

        // Store the module metadata on the class
        Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
    };
}
