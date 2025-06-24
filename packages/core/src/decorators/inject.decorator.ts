import { INJECT_TOKEN_KEY } from '../constants';
import { Token } from '../types';

/**
 * Parameter decorator that allows injecting a dependency using a custom token.
 * Useful for injecting values or services that aren’t classes (e.g., configuration objects).
 *
 * @param token The injection token (class constructor, string, or symbol) to resolve from the DI container.
 * @returns A parameter decorator function that stores the token metadata for later resolution.
 * @public
 */
export function Inject(token: Token): ParameterDecorator {
    return (target: object, _propertyKey: string | symbol | undefined, parameterIndex: number) => {
        // Retrieve any existing custom tokens or initialize a new array
        const customTokens: Token[] = Reflect.getOwnMetadata(INJECT_TOKEN_KEY, target) || [];

        // Assign the provided token at the correct parameter index
        customTokens[parameterIndex] = token;

        // Store the updated token array back on the target
        Reflect.defineMetadata(INJECT_TOKEN_KEY, customTokens, target);
    };
}
