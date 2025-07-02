import { Scope } from '../enums';
import { Type, Token } from './common.types';

/**
 * Describes a provider that binds a token to a pre-existing value.
 * Useful for injecting configuration objects, constants, or mock objects in tests.
 *
 * @template T The type of the value to be injected.
 */
export interface ValueProvider<T = any> {
    /**
     * The injection token used to identify this provider.
     */
    provide: Token<T>;
    /**
     * The actual value to be injected when the token is requested.
     */
    useValue: T;

    scope?: Scope;
}

/**
 * Describes a provider that binds a token to an instance of a specified class.
 * The DI container will instantiate the `useClass` and inject its dependencies.
 *
 * @template T The type of the class to be instantiated.
 */
export interface ClassProvider<T = any> {
    /**
     * The injection token used to identify this provider.
     */
    provide: Token<T>;
    /**
     * The class to be instantiated and injected.
     */
    useClass: Type<T>;

    scope?: Scope;
}

/**
 * A provider that constructs via a factory function.
 */
export interface FactoryProvider<T = unknown> {
    provide: Token<T>;
    useFactory: (...args: any[]) => T | Promise<T>;
    inject?: Array<{ token: Token<any>; optional?: boolean }>;
    scope?: Scope;
}

/**
 * Describes how a dependency should be provided. A provider can be:
 * - A class `Type` (shorthand for `{ provide: Type, useClass: Type }`).
 * - A `ValueProvider` object.
 * - A `ClassProvider` object.
 *
 * @template T The type of the provided value.
 */
export type Provider<T = unknown> = Type<T> | ValueProvider<T> | ClassProvider<T> | FactoryProvider<T>;
