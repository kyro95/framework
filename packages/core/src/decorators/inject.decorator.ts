import { INJECT_TOKEN_KEY, INJECT_PROPERTY_KEY } from '../constants';
import { Token } from '../types';

/**
 * Decorator to inject dependencies into constructor parameters or class properties.
 *
 * When applied to a parameter, stores the custom injection token for that parameter index.
 * When applied to a property, records the injection token to resolve and assign the dependency after instantiation.
 *
 * @param token The injection token (class constructor, string, or symbol) to resolve from the DI container.
 * @returns A decorator function usable as both a ParameterDecorator and PropertyDecorator.
 * @public
 */
export function Inject(token: Token): PropertyDecorator & ParameterDecorator {
    const decoratorFn = (target: object, propertyKey: string | symbol, parameterIndex?: number): void => {
        if (typeof parameterIndex === 'number') {
            // Parameter injection: record token for constructor parameter
            const existingParams: Token[] = Reflect.getOwnMetadata(INJECT_TOKEN_KEY, target) || [];
            existingParams[parameterIndex] = token;
            Reflect.defineMetadata(INJECT_TOKEN_KEY, existingParams, target);
        } else {
            // Property injection: record token for class property
            const ctor = target.constructor;
            const existingProps: { key: string | symbol; token: Token }[] =
                Reflect.getOwnMetadata(INJECT_PROPERTY_KEY, ctor) || [];
            existingProps.push({ key: propertyKey, token });
            Reflect.defineMetadata(INJECT_PROPERTY_KEY, existingProps, ctor);
        }
    };

    return decoratorFn as PropertyDecorator & ParameterDecorator;
}
