import { createRpcDecorator, RpcType } from '@aurora-mp/core';

export function OnWebViewRpc<E extends string>(webviewId: string | number, rpcName?: E): MethodDecorator {
    return createRpcDecorator(RpcType.ON_SERVER, rpcName, webviewId);
}
