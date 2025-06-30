import { Injectable, type ILogger, CONFIG_SERVICE, type IConfigService, Inject } from '@aurora-mp/core';
import { winstonLogger } from '../configs';

@Injectable()
export class LoggerService implements ILogger {
    private readonly logger = winstonLogger;
    private readonly isDebug: boolean;

    constructor(@Inject(CONFIG_SERVICE) private readonly config: IConfigService) {
        this.isDebug = this.config.get<boolean>('DEBUG', false);
        this.logger.level = this.isDebug ? 'debug' : 'info';
    }

    public debug(message: string): void {
        this.logger.debug(message);
    }

    public info(message: string): void {
        this.logger.info(message);
    }

    public warn(message: string): void {
        this.logger.warn(message);
    }

    public error(message: string | Error): void {
        if (message instanceof Error) {
            this.logger.error(message.stack ?? message.message);
        } else {
            this.logger.error(message);
        }
    }
}
