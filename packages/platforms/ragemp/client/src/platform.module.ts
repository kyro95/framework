import { Global, LOGGER_SERVICE, Module, PLATFORM_DRIVER } from '@aurora-mp/core';
import { RageClientDriver } from './driver';
import { LoggerService } from './services';

/**
 * This internal module provides and exports the platform-specific services.
 * It is marked as @Global() so that its exports are available everywhere
 * in the application without needing to import this module explicitly.
 *
 * The key is the custom provider definition:
 * `{ provide: LOGGER_SERVICE, useClass: (Rage)LoggerService }`
 * This tells the DI system: "When someone asks for the generic LOGGER_SERVICE token,
 * instantiate and provide an instance of the (Rage)LoggerService class."
 */
@Global()
@Module({
    providers: [
        {
            provide: LOGGER_SERVICE,
            useClass: LoggerService,
        },
        {
            provide: PLATFORM_DRIVER,
            useClass: RageClientDriver,
        },
    ],
    exports: [LOGGER_SERVICE],
})
export class PlatformModule {}
