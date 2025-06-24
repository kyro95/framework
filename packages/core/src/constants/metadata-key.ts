/** @internal Symbol key for storing module-level metadata (e.g., imports, providers, controllers). */
export const MODULE_METADATA_KEY = Symbol.for('aurora:module');

/** @internal Symbol key for marking a module as globally available across the application. */
export const GLOBAL_MODULE_KEY = Symbol.for('aurora:global:module');

/** @internal Symbol key for storing metadata about controllers attached to a module. */
export const CONTROLLER_METADATA_KEY = Symbol.for('aurora:controller');

/**
 * @internal
 * Symbol key for storing all event-handler definitions on a controller class.
 * Each entry maps a method name to its event metadata.
 */
export const CONTROLLER_EVENTS_KEY = Symbol.for('aurora:controller:events');

/**
 * @internal
 * Symbol key for storing parameter metadata for controller event handlers.
 * Used to resolve and inject arguments when an event is dispatched.
 */
export const CONTROLLER_PARAMS_KEY = Symbol.for('aurora:controller:params');

/** @internal Symbol key for storing custom injection tokens assigned to constructor parameters. */
export const INJECT_TOKEN_KEY = Symbol.for('aurora:inject');

/** @internal Symbol key for storing metadata on injectable classes (services, providers). */
export const INJECTABLE_METADATA_KEY = Symbol.for('aurora:injectable');

/** @internal Symbol key for storing scope-related options on injectable classes. */
export const INJECTABLE_SCOPE_OPTIONS = Symbol.for('aurora:injectable:scope:options');

/** @internal Symbol key for storing metadata about individual event handler methods. */
export const EVENT_HANDLER_KEY = Symbol.for('aurora:event:handler');
