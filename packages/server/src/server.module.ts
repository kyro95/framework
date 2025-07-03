import { CONFIG_SERVICE, EVENT_SERVICE, Global, Module, RPC_SERVICE } from '@aurora-mp/core';
import { ConfigService, EventService, RpcService } from './services';

/**
 * Provides shared server-side services.
 * Users should import this module into their application's root module.
 */
@Global()
@Module({
    providers: [
        {
            provide: CONFIG_SERVICE,
            useClass: ConfigService,
        },
        {
            provide: EVENT_SERVICE,
            useClass: EventService,
        },
        {
            provide: RPC_SERVICE,
            useClass: RpcService,
        },
    ],
    exports: [CONFIG_SERVICE, EVENT_SERVICE, RPC_SERVICE],
})
export class ServerModule {}
