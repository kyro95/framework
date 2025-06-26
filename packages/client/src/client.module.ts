import { EVENT_SERVICE, Global, Module, WEBVIEW_SERVICE } from '@aurora-mp/core';
import { EventService } from './services';
import { WebviewService } from './services/webview.service';

/**
 * Provides shared client-side services.
 */
@Global()
@Module({
    providers: [
        {
            provide: EVENT_SERVICE,
            useClass: EventService,
        },
        {
            provide: WEBVIEW_SERVICE,
            useClass: WebviewService,
        },
    ],
    exports: [EVENT_SERVICE, WEBVIEW_SERVICE],
})
export class ClientModule {}
