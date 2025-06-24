/**
 * Represents a JavaScript class constructor that can be called with `new` to create instances of type T.
 *
 * @template T The type of object created by this constructor. Defaults to `unknown`.
 * @example
 * ```ts
 * class MyService {
 *   constructor(private name: string) {}
 * }
 * const serviceCtor: Type<MyService> = MyService;
 * const instance = new serviceCtor('Aurora');
 * ```
 * @public
 */
export interface Type<T = unknown> {
    /**
     * Constructor signature for creating an instance of T.
     *
     * @param args Arguments passed to the class constructor.
     * @returns A new instance of type T.
     */
    new (...args: any[]): T;
}

/**
 * A token used to uniquely identify a provider in the DI container.
 * Tokens can be:
 * - A class constructor (`Type<T>`)
 * - A `string`
 * - A `symbol`
 *
 * @template T The type of the value represented by this token. Defaults to `any`.
 * @see {@link Type}
 * @public
 */
export type Token<T = any> = Type<T> | string | symbol;
