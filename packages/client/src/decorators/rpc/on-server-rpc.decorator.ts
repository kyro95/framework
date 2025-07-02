import { createRpcDecorator, RpcType } from '@aurora-mp/core';

export function OnServerRpc<E extends string>(rpcName?: E): MethodDecorator {
    return createRpcDecorator(RpcType.ON_SERVER, rpcName);
}
