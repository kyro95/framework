/**
 * Defines the lifetime scopes for injectable providers in the Aurora DI container.
 *
 * @public
 */
export enum Scope {
    /**
     * A single shared instance is created once and reused for all injections.
     */
    SINGLETON,

    /**
     * A new instance is created every time the provider is injected.
     */
    TRANSIENT,
}
