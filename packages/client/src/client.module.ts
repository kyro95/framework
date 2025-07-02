import { EVENT_SERVICE, Global, Module, RPC_SERVICE, WEBVIEW_SERVICE } from '@aurora-mp/core';
import { EventService } from './services';
import { WebviewService } from './services/webview.service';
import { RpcService } from './services/rpc.service';

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
            provide: RPC_SERVICE,
            useClass: RpcService,
        },
        {
            provide: WEBVIEW_SERVICE,
            useClass: WebviewService,
        },
    ],
    exports: [EVENT_SERVICE, RPC_SERVICE, WEBVIEW_SERVICE],
})
export class ClientModule {}
