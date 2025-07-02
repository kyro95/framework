import { RpcMetadata } from '../../types';
import { CONTROLLER_RPCS_KEY } from '../../constants';
import { RpcType } from '../../enums';

export function createRpcDecorator(type: RpcType, name?: string): MethodDecorator {
    return (target: object, methodKey: string | symbol) => {
        const rpcName = name ?? (methodKey as string);
        const existingRpcs: RpcMetadata[] = Reflect.getOwnMetadata(CONTROLLER_RPCS_KEY, target.constructor) ?? [];

        const updatedRpcs: RpcMetadata[] = [
            ...existingRpcs,
            {
                type,
                name: rpcName,
                methodName: methodKey as string,
                params: [],
                // TODO: ...(webViewId !== undefined ? { webViewId } : {}),
            },
        ];

        Reflect.defineMetadata(CONTROLLER_RPCS_KEY, updatedRpcs, target.constructor);
    };
}
