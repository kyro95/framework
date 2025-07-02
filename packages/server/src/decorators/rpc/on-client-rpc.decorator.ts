import { createRpcDecorator, RpcType } from '@aurora-mp/core';

export function OnClientRpc<E extends string>(rpcName?: E): MethodDecorator {
    return createRpcDecorator(RpcType.ON_CLIENT, rpcName);
}
