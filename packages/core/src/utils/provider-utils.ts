import { Provider, Token, Type } from '../types';
import { Scope } from '../enums';
import { INJECTABLE_SCOPE_OPTIONS } from '../constants';

/**
 * A safe, generic type for any class constructor.
 *
 * @template T The instance type created by the constructor.
 * @public
 */
type AbstractConstructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Determines the lifetime scope (singleton or transient) for a given provider or class.
 *
 * - If the provider is a class constructor, reads its metadata.
 * - If the provider is an object with `useClass`, reads metadata from that class.
 * - If the provider is an object with `useValue`, infers the class from the value’s constructor.
 *
 * Falls back to `Scope.SINGLETON` when no metadata is found.
 *
 * @param provider Either a class constructor or a Provider object.
 * @returns The {@link Scope} of the provider: `SINGLETON` or `TRANSIENT`.
 * @public
 */
export function getProviderScope(provider: Type<unknown> | Provider<unknown>): Scope {
    let ctor: AbstractConstructor | undefined;

    if (typeof provider === 'function') {
        // Direct class provider
        ctor = provider as AbstractConstructor;
    } else if ('useClass' in provider && provider.useClass) {
        // Provider object with a class
        ctor = provider.useClass as AbstractConstructor;
    } else if ('useValue' in provider && provider.useValue) {
        // Provider object with a value: infer constructor from the value instance
        ctor = (provider.useValue as { constructor: AbstractConstructor }).constructor;
    }

    // Read the stored scope metadata or default to SINGLETON
    return ctor ? (Reflect.getMetadata(INJECTABLE_SCOPE_OPTIONS, ctor) ?? Scope.SINGLETON) : Scope.SINGLETON;
}

/**
 * Normalizes a provider definition into a standard object shape.
 *
 * - If given a class constructor, returns `{ provide, useClass }`.
 * - If given a Provider object, returns it unchanged.
 *
 * This ensures downstream logic can uniformly handle providers.
 *
 * @template T The type provided by this provider.
 * @param provider A class constructor or a Provider object.
 * @returns An object with explicit `provide`, and either `useClass` or `useValue`.
 * @public
 */
export function normalizeProvider<T = unknown>(
    provider: Provider<T>,
): { provide: Token<T>; useClass?: Type<T>; useValue?: T } {
    if (typeof provider === 'function') {
        // Treat a bare class constructor as a provider
        return { provide: provider, useClass: provider };
    }
    // Already in the proper Provider shape
    return provider;
}
