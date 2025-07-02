import {
    type ILogger,
    Inject,
    Injectable,
    type IPlatformDriver,
    LOGGER_SERVICE,
    PLATFORM_DRIVER,
} from '@aurora-mp/core';

@Injectable()
export class RpcService<TPlayer = any> {
    /**
     * @param platformDriver - The platform-specific driver implementation,
     *                         injected via the PLATFORM_DRIVER token.
     */
    constructor(
        @Inject(PLATFORM_DRIVER) private readonly platformDriver: IPlatformDriver<TPlayer>,
        @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    ) {}

    public async invokeServer<T = any>(method: string, ...args: unknown[]): Promise<T> {
        if (!this.platformDriver.invokeServer) {
            const err = new Error(`[RpcService] invokeServer not implemented on platformDriver.`);
            this.logger.error(err);
            throw err;
        }

        try {
            const result = await this.platformDriver.invokeServer<T>(method, ...args);
            return result;
        } catch (error) {
            this.logger.error(`[RpcService] Rpc error on method: ${method}, error: ${error}`);
            throw error;
        }
    }
}
