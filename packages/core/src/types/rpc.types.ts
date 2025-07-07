import { Guard, MethodParameter } from '../interfaces';
import { RpcType } from '../enums';
import { Type } from '../types';

/**
 * Metadata describing a controller method exposed as an RPC handler.
 *
 * @public
 */
export interface RpcMetadata {
    /**
     * The kind of RPC this handler processes (e.g., REQUEST, RESPONSE).
     */
    type: RpcType;

    /**
     * The RPC channel or name used to invoke this handler.
     */
    name: string;

    /**
     * The name of the class method that will be called for this RPC.
     */
    methodName: string;

    /**
     * Metadata for each parameter of the handler method, indicating how to
     * resolve its value at runtime (player object, payload, specific properties, etc.).
     */
    params: MethodParameter[];

    /**
     * When the RPC originates from a specific WebView, this can target that view.
     */
    webViewId?: string | number;

    /**
     * An optional list of Guard classes to run before executing the handler.
     * Each guard must implement the Guard interface's `canActivate` method.
     */
    guards?: Type<Guard>[];
}
