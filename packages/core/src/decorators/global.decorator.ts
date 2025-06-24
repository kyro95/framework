import { GLOBAL_MODULE_KEY } from '../constants';

/**
 * Class decorator that marks a module as global within the Aurora framework.
 * Global modules are available in every other module without needing to be imported.
 *
 * @throws {Error} if applied more than once on the same class.
 * @public
 */
export function Global(): ClassDecorator {
    return (target) => {
        // Prevent multiple @Global annotations on the same class
        if (Reflect.hasOwnMetadata(GLOBAL_MODULE_KEY, target)) {
            throw new Error(`Cannot apply @Global decorator multiple times on the same target (${target.name}).`);
        }

        // Define metadata flag to mark this class as a global module
        Reflect.defineMetadata(GLOBAL_MODULE_KEY, true, target);
    };
}
