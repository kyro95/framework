import { Type, Token } from './common.types';
import { Provider } from './provider.types';

/**
 * Defines the structure of a module’s configuration in the Aurora framework.
 * A module bundles related controllers, providers, and imports/exports into a cohesive unit.
 *
 * @public
 */
export interface ModuleMetadata {
    /**
     * Other modules whose exported providers/controllers should be available
     * for injection within this module.
     *
     * @remarks
     * Imported modules’ exports are merged into this module’s DI scope.
     */
    imports?: Type[];

    /**
     * Controller classes that belong to this module.
     * These will be instantiated and have their event handlers bound at startup.
     */
    controllers?: Type[];

    /**
     * Provider definitions (classes or useValue objects) registered in this module’s DI container.
     * These are the services and values available for injection into controllers and other providers.
     */
    providers?: Provider[];

    /**
     * Tokens of providers or controllers that this module makes available
     * to modules that import it.
     *
     * @remarks
     * Only exported tokens can be consumed by importing modules.
     */
    exports?: Token[];
}
