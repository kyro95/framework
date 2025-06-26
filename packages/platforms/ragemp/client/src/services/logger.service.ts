import { Injectable, ILogger } from '@aurora-mp/core';

@Injectable()
export class LoggerService implements ILogger {
    public debug(message: string): void {
        mp.console.logInfo(message);
    }
    public info(message: string): void {
        mp.console.logInfo(message);
    }
    public warn(message: string): void {
        mp.console.logWarning(message);
    }
    public error(message: string): void {
        mp.console.logError(message);
    }
}
