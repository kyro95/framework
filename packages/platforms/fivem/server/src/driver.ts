import { IPlatformDriver } from '@aurora-mp/core';

/**
 * Implements the IPlatformDriver interface using the FiveM server-side API.
 */
export class FiveMServerDriver implements IPlatformDriver {
    public on(eventName: string, listener: (...args: unknown[]) => void): void {
        on(eventName, listener);
    }

    /*public onClient(eventName: string, listener: (player: PlayerMp, ...args: any[]) => void): void {
        //mp.events.add(eventName, listener);
    }*/

    public emit(eventName: string, ...args: unknown[]): void {
        emit(eventName, args);
    }

    /*public emitClient(player: PlayerMp, eventName: string, ...args: any[]): void {
        //player.call(eventName, args);
    }*/
}
