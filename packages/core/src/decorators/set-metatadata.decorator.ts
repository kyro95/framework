/**
 * Attaches arbitrary metadata to a class or class member (method/property).
 *
 * @template T
 * @param key - The metadata key, typically a symbol or unique string.
 * @param value - The metadata value to store under the given key.
 * @returns A decorator that applies the metadata via Reflect.defineMetadata.
 */
export function SetMetadata<T = any>(key: string | symbol, value: T): ClassDecorator & MethodDecorator {
    return (target: Function | Object, propertyKey?: string | symbol, _descriptor?: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata(key, value, target, propertyKey!);
    };
}
