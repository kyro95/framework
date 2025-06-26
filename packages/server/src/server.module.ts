import { CONFIG_SERVICE, EVENT_SERVICE, Global, Module } from '@aurora-mp/core';
import { ConfigService, EventService } from './services';

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
    ],
    exports: [CONFIG_SERVICE, EVENT_SERVICE],
})
export class ServerModule {}
