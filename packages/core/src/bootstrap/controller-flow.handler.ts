import { EventMetadata } from '../types';
import { ExecutionContext, MethodParameter } from '../interfaces';
import { MethodParamType } from '../enums';

/**
 * Orchestrates the execution pipeline for controller event handlers:
 * - Resolves method parameters (via decorators)
 * - Applies any interceptors or middleware
 * - Invokes the decorated handler method on the controller instance
 *
 * This class is used internally by {@link ApplicationFactory} via {@link EventBinder}
 *
 * @category Core
 * @public
 */
export class ControllerFlowHandler {
    /**
     * Maps the ExecutionContext to an array of arguments for the controller method.
     * @param context The current execution context.
     * @param event The metadata for the event handler.
     * @returns An array of arguments to be applied to the controller method.
     */
    public createArgs(context: ExecutionContext, event: EventMetadata): unknown[] {
        if (!event.params?.length) {
            return context.args;
        }

        const args: unknown[] = [];
        const sortedParams: MethodParameter[] = event.params.sort((a, b) => a.index - b.index);

        for (const param of sortedParams) {
            switch (param.type) {
                case MethodParamType.PAYLOAD:
                case MethodParamType.PARAM:
                    args[param.index] = this.getPayloadValue(context.args, param.data);
                    break;

                case MethodParamType.PLAYER:
                    if (param.data && context.player && typeof context.player === 'object') {
                        args[param.index] = (context.player as Record<string, unknown>)[param.data as string];
                    } else {
                        args[param.index] = context.player;
                    }
                    break;

                default:
                    throw new Error(`[Aurora] Unknown parameter type '${(param as { type?: unknown }).type}'`);
            }
        }

        return args;
    }

    private getPayloadValue(args: unknown[], key?: string): unknown {
        const player = args[0];
        const isPlayerLike = player && typeof player === 'object' && 'id' in player;

        // If a key is provided, search for an object with that key in the arguments.
        if (key) {
            for (const arg of args) {
                if (arg && typeof arg === 'object' && key in arg) {
                    return (arg as Record<string, unknown>)[key];
                }
            }
            return undefined;
        }

        // If no key, and the event is from a client, assume payload is the second argument.
        if (isPlayerLike && args.length > 1) {
            return args[1];
        }

        // Otherwise, assume payload is the first argument.
        return args[0];
    }
}
