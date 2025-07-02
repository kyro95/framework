import { RpcType } from '../enums';
import { CONTROLLER_PARAMS_KEY, CONTROLLER_RPCS_KEY } from '../constants';
import { IPlatformDriver } from '../interfaces';
import { RpcMetadata, Type } from '../types';
import { ControllerFlowHandler } from './controller-flow.handler';

export class RpcBinder {
    constructor(
        private readonly platformDriver: IPlatformDriver,
        private readonly flowHandler: ControllerFlowHandler,
    ) {}

    public bindControllerRpcs(controllers: [Type, Record<string, unknown>][]) {
        for (const [ctor, instance] of controllers) {
            const rpcs: RpcMetadata[] = Reflect.getMetadata(CONTROLLER_RPCS_KEY, ctor) || [];
            for (const rpc of rpcs) {
                const params = Reflect.getOwnMetadata(CONTROLLER_PARAMS_KEY, ctor.prototype, rpc.methodName) || [];
                rpc.params = params;

                const dispatcher = this.createDispatcher(instance, rpc);

                // Register to platform
                switch (rpc.type) {
                    case RpcType.ON_CLIENT:
                        if (this.platformDriver.onRpcServer) this.platformDriver.onRpcServer(rpc.name, dispatcher);
                        break;
                    case RpcType.ON_SERVER:
                        if (this.platformDriver.onRpcClient) this.platformDriver.onRpcClient(rpc.name, dispatcher);
                        break;
                }
            }
        }
    }

    private createDispatcher(
        instance: Record<string, unknown>,
        rpc: RpcMetadata,
    ): (...args: unknown[]) => Promise<unknown> {
        return async (...args: unknown[]) => {
            try {
                const context = {
                    name: rpc.name,
                    args,
                    payload: args,
                    // TODO: player: handler.type === EventType.ON_CLIENT ? args[0] : undefined,
                };

                const methodArgs = this.flowHandler.createArgs(context, rpc);
                return await (instance[rpc.methodName] as (...a: any[]) => any)(...methodArgs);
            } catch (error) {
                console.error(
                    `[AuroraDI] Error handling RPC "${rpc.name}" on "${(instance as { constructor: { name: string } }).constructor.name}"`,
                    error,
                );
            }
        };
    }
}
