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

    /*public createArgs(context: ExecutionContext, event: EventMetadata): unknown[] {
		if (!event.params?.length) {
			// No decorated parameters: return raw arguments as-is
			return context.args;
		}

		// Prepare the output argument array
		const args: unknown[] = [];

		// Sort parameters by their declared index to respect method signature order
		const sortedParams: MethodParameter[] = [...event.params].sort((a, b) => a.index - b.index);

		// Raw arguments passed by the platform driver: [player, ...payloadArgs]
		const rawArgs = context.args;

		// Iterate through each parameter metadata and resolve its value inline
		for (const param of sortedParams) {
			let value: unknown;
			switch (param.type) {
				case MethodParamType.PLAYER:
					// @Player() decorator -> always first argument (player object or property)
					value = param.data ? (rawArgs[0] as any)[param.data] : rawArgs[0];
					break;

				case MethodParamType.PAYLOAD:
					// @Payload() decorator -> return second argument if it's an object,
					// otherwise return all subsequent arguments as an array
					const potentialObject = rawArgs[1];
					value =
						potentialObject != null && typeof potentialObject === 'object'
							? potentialObject
							: rawArgs.slice(1);
					break;

				case MethodParamType.PARAM:
					// @Param('key') decorator -> extract from payload object or fallback to positional
					const payloadCandidate = rawArgs[1];
					if (payloadCandidate != null && typeof payloadCandidate === 'object') {
						// Payload is object: return the specified property
						value = (payloadCandidate as any)[param.data as string];
					} else {
						// Fallback: payload is flattened primitives, use method parameter index
						value = rawArgs[param.index];
					}
					break;

				default:
					throw new Error(`[Aurora] Unknown parameter type: ${(param as any).type}`);
			}

			// Assign resolved value into correct position
			args[param.index] = value;
		}

		return args;
	}*/
}
