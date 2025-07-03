import { type ILogger, Inject, Injectable, LOGGER_SERVICE } from '@aurora-mp/core';

@Injectable()
export class AppService {
    constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILogger) {}

    public helloWorld(): void {
        this.logger.info(`Hello world!`);
    }
}
