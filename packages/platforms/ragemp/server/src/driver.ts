import { IPlatformDriver } from '@aurora-mp/core';

/**
 * Implements the IPlatformDriver interface using the RAGE Multiplayer server-side API.
 */
export class RageServerDriver implements IPlatformDriver {
    public on(eventName: string, listener: (...args: unknown[]) => void): void {
        mp.events.add(eventName, listener);
    }

    public onClient(eventName: string, listener: (player: PlayerMp, ...args: any[]) => void): void {
        mp.events.add(eventName, listener);
    }

    public emit(eventName: string, ...args: unknown[]): void {
        mp.events.call(eventName, args);
    }

    public emitClient(player: PlayerMp, eventName: string, ...args: any[]): void {
        player.call(eventName, args);
    }
}
