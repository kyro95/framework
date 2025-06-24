import { Scope } from '../enums';

/**
 * Configuration options for the {@link Injectable} decorator.
 * Allows customization of the provider’s lifetime scope.
 *
 * @public
 */
export interface InjectableOptions {
    /**
     * The lifetime scope of the injectable provider.
     * - `Scope.SINGLETON` (default): a single shared instance.
     * - `Scope.TRANSIENT`: a new instance per injection.
     */
    scope?: Scope;
}
