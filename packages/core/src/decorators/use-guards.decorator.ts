import { Type } from '../types';
import { GUARDS_METADATA_KEY } from '../constants';
import { Guard } from '../interfaces';

/**
 * Decorator that attaches one or more Guard classes to a class or to a specific method.
 *
 * When applied at the class level, all methods of the class will be protected
 * by the specified guards. When applied to a method, only that method will be protected.
 *
 * @param guards - One or more guard constructors implementing the Guard interface.
 * @returns A decorator usable on classes and methods.
 *
 * @example
 * // Class-level guards
 * @UseGuards(AuthGuard, RoleGuard)
 * class MyController { ... }
 *
 * // Event-level guards
 * @UseGuards(AuthGuard, RoleGuard)
 * class MyController {
 *   @UseGuards(MyGuard)
 *   @On()
 *   onMyEvent() { ... }
 * }
 *
 * // Method-level guards
 * class MyService {
 *   @UseGuards(PermissionsGuard)
 *   sensitiveOperation() { ... }
 * }
 */
export function UseGuards(...guards: Type<Guard>[]): ClassDecorator & MethodDecorator {
    return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (propertyKey && descriptor) {
            const existing: Type<Guard>[] = Reflect.getMetadata(GUARDS_METADATA_KEY, target, propertyKey) || [];
            Reflect.defineMetadata(GUARDS_METADATA_KEY, [...existing, ...guards], target, propertyKey);
        } else {
            const existing: Type<Guard>[] = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || [];
            Reflect.defineMetadata(GUARDS_METADATA_KEY, [...existing, ...guards], target);
        }
    };
}
