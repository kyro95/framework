import { EventType } from '../enums';
import { CONTROLLER_EVENTS_KEY, CONTROLLER_PARAMS_KEY, GUARDS_METADATA_KEY } from '../constants';
import { ExecutionContext, IPlatformDriver } from '../interfaces';
import { EventMetadata, Type } from '../types';
import { ControllerFlowHandler } from './controller-flow.handler';

/**
 * EventBinder attaches decorated controller events to the platform driver.
 *
 * @category Core
 * @public
 */
export class EventBinder {
    constructor(
        private readonly platformDriver: IPlatformDriver,
        private readonly flowHandler: ControllerFlowHandler,
    ) {}

    /**
     * Binds all controller event handlers for a given set of modules/controllers.
     * @param controllersWithInstances Array of [ControllerClass, controllerInstance]
     */
    public bindControllerEvents(controllersWithInstances: [Type, Record<string, unknown>][]) {
        for (const [controllerType, controllerInstance] of controllersWithInstances) {
            const eventHandlers: EventMetadata[] = Reflect.getMetadata(CONTROLLER_EVENTS_KEY, controllerType) || [];
            for (const handler of eventHandlers) {
                // Attach runtime param metadata
                const params =
                    Reflect.getOwnMetadata(CONTROLLER_PARAMS_KEY, controllerType.prototype, handler.methodName) ?? [];
                handler.params = params;

                // Attach runtime guards metadata
                const guards =
                    Reflect.getOwnMetadata(GUARDS_METADATA_KEY, controllerType.prototype, handler.methodName) ?? [];
                handler.guards = guards;

                // Dispatcher = wraps flowHandler param injection
                const dispatcher = this.createDispatcher(controllerInstance, handler);

                // Register to platform
                switch (handler.type) {
                    case EventType.ON:
                        this.platformDriver.on(handler.name, dispatcher);
                        break;
                    case EventType.ON_CLIENT:
                        if (this.platformDriver.onClient) this.platformDriver.onClient(handler.name, dispatcher);
                        break;
                    case EventType.ON_SERVER:
                        if (this.platformDriver.onServer) this.platformDriver.onServer(handler.name, dispatcher);
                        break;
                }
            }
        }
    }

    /**
     * Creates a dispatcher for the event handler method (param injection).
     */
    private createDispatcher(
        instance: Record<string, unknown>,
        handler: EventMetadata,
    ): (...args: unknown[]) => Promise<void> {
        return async (...args: unknown[]) => {
            try {
                const context: ExecutionContext = {
                    name: handler.name,
                    args,
                    payload: args,
                    player: handler.type === EventType.ON_CLIENT ? args[0] : undefined,
                    getClass: () => instance.constructor as Type,
                    getHandler: () => instance[handler.methodName] as Function,
                    getPlayer: () => args[0],
                };

                const allowed = await this.flowHandler.canActivate(context);
                if (!allowed) {
                    console.warn(`[Aurora] Access denied for event "${handler.name}"`);
                    return;
                }

                const methodArgs = this.flowHandler.createArgs(context, handler);
                await (instance[handler.methodName] as (...a: unknown[]) => Promise<void> | void)(...methodArgs);
            } catch (error) {
                console.error(
                    `[Aurora] Error handling event "${handler.name}" on "${(instance as { constructor: { name: string } }).constructor.name}"`,
                    error,
                );
            }
        };
    }
}
