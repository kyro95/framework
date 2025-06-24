import { MethodParamType } from '../enums';
import { ArgumentMetadata } from './argument-metadata.interface';

/**
 * Metadata for a controller method parameter that receives
 * the entire event payload.
 *
 * @public
 */
export interface PayloadParameter extends ArgumentMetadata {
    /**
     * The parameter kind: inject the full payload object.
     */
    type: MethodParamType.PAYLOAD;
}

/**
 * Metadata for a controller method parameter that receives
 * a specific property from the event payload.
 *
 * @public
 */
export interface ParamParameter extends ArgumentMetadata {
    /**
     * The parameter kind: inject a single payload property.
     */
    type: MethodParamType.PARAM;

    /**
     * The key of the property to extract from the payload.
     */
    data: string;
}

/**
 * Metadata for a controller method parameter that receives
 * the player instance associated with the event.
 *
 * @public
 */
export interface PlayerParameter extends ArgumentMetadata {
    /**
     * The parameter kind: inject the player object.
     */
    type: MethodParamType.PLAYER;
}

/**
 * Union type covering all possible controller method
 * parameter metadata shapes (payload, single property, or player).
 *
 * @public
 */
export type MethodParameter = PayloadParameter | ParamParameter | PlayerParameter;
