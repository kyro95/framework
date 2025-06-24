import { MethodParamType } from '../enums/method-param-type.enum';

/**
 * Describes metadata for a single parameter of a controller event handler,
 * indicating what value should be injected at runtime.
 *
 * @public
 */
export interface ArgumentMetadata {
    /**
     * The kind of parameter to inject (entire payload, single property, player object, etc.).
     */
    type: MethodParamType;

    /**
     * The zero-based position of this parameter in the method signature.
     */
    index: number;

    /**
     * Optional extra data for the decorator, such as the payload property key
     * when `type` is `MethodParamType.PARAM`.
     */
    data?: string;
}
