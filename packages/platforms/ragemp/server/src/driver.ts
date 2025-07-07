import { IPlatformDriver } from '@aurora-mp/core';

/**
 * Implements the IPlatformDriver interface using the RAGE Multiplayer server-side API.
 */
export class RageServerDriver implements IPlatformDriver {
    public on(eventName: string, listener: (...args: unknown[]) => void): void {
        mp.events.add(eventName, listener);
    }

    public off(eventName: string, listener: (...args: any[]) => void): void {
        mp.events.remove(eventName, listener);
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

    public async invokeClient<T = any, TArgs extends any[] = any[]>(
        player: PlayerMp,
        rpcName: string,
        ...args: TArgs
    ): Promise<T> {
        try {
            const result = (await player.callProc(rpcName, ...args)) as T;
            return result;
        } catch (error) {
            console.error(`[RPC] invokeClient failed for "${rpcName}":`, error);
            throw error;
        }
    }

    public onRpcServer(rpcName: string, handler: (...args: unknown[]) => Promise<unknown> | unknown): void {
        mp.events.addProc(rpcName, async (...allArgs: unknown[]) => {
            try {
                return await handler(...allArgs);
            } catch (err) {
                return { error: (err as Error).message };
            }
        });
    }
}
