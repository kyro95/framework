import { MethodParamType } from '../../enums';
import { CONTROLLER_PARAMS_KEY } from '../../constants';
import { MethodParameter } from '../../interfaces';

/**
 * Factory to create parameter decorators for controller event handlers.
 * Each decorator specifies how to resolve a method parameter at runtime.
 *
 * @param type The kind of parameter to inject (from MethodParamType enum).
 * @returns A function that accepts optional data and returns a ParameterDecorator.
 *
 * @public
 */
export function createParamDecorator(type: MethodParamType): (data?: unknown) => ParameterDecorator {
    return (data?: any): ParameterDecorator => {
        return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
            // Skip if the decorator is used on a constructor parameter (unsupported here)
            if (!propertyKey) {
                return;
            }

            const paramTypes: any[] = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey) || [];

            // Retrieve existing parameter metadata for this method, or start fresh
            const existingParams: MethodParameter[] =
                Reflect.getOwnMetadata(CONTROLLER_PARAMS_KEY, target, propertyKey) ?? [];

            // Append this parameter’s metadata: its index, type, and any extra data
            existingParams.push({
                index: parameterIndex,
                type,
                data,
                metatype: paramTypes[parameterIndex],
                method: propertyKey.toString(),
            });

            // Define updated metadata back on the method for later resolution
            Reflect.defineMetadata(CONTROLLER_PARAMS_KEY, existingParams, target, propertyKey);
        };
    };
}
