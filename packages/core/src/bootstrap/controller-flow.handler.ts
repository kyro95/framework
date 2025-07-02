import { EventMetadata, RpcMetadata } from '../types';
import { ExecutionContext, MethodParameter } from '../interfaces';
import { MethodParamType } from '../enums';

/**
 * Orchestrates the execution pipeline for controller event handlers:
 * - Resolves method parameters (via decorators)
 * - Invokes the decorated handler method on the controller instance
 *
 * This class is used internally by ApplicationFactory via EventBinder.
 *
 * @category Core
 * @public
 */
export class ControllerFlowHandler {
    /**
     * Maps the ExecutionContext to an array of arguments for the controller method.
     * @param context The current execution context containing raw arguments.
     * @param event Metadata for the event handler including parameter definitions.
     * @returns An array of arguments to apply to the controller method.
     */
    public createArgs(context: ExecutionContext, handler: EventMetadata | RpcMetadata): unknown[] {
        // If no parameter decorators, return raw args
        if (!handler.params?.length) {
            return context.args;
        }

        // Sort by original method signature index
        const sorted: MethodParameter[] = [...handler.params].sort((a, b) => a.index - b.index);
        const rawArgs = context.args;
        const args: unknown[] = [];

        for (const param of sorted) {
            let value: unknown;
            switch (param.type) {
                case MethodParamType.PLAYER:
                    // @Player() or @Player('prop')
                    value = param.data ? (rawArgs[0] as any)[param.data] : rawArgs[0];
                    break;

                case MethodParamType.PAYLOAD:
                    // @Payload() -> whole payload object
                    // @Payload('key') -> payload[key]
                    const payload = rawArgs[1];
                    if (payload != null && typeof payload === 'object') {
                        value = param.data ? (payload as any)[param.data] : payload;
                    } else {
                        // fallback: flattened primitives
                        value = rawArgs.slice(1);
                    }
                    break;

                case MethodParamType.PARAM:
                    // @Param('key') always extracts from payload object if present
                    const obj = rawArgs[1];
                    if (obj != null && typeof obj === 'object') {
                        value = (obj as any)[param.data as string];
                    } else {
                        // fallback: positional
                        value = rawArgs[param.index];
                    }
                    break;

                default:
                    throw new Error(`Unknown parameter type ${(param as any).type}`);
            }
            args[param.index] = value;
        }

        return args;
    }
}
