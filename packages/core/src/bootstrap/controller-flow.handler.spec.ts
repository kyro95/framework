import 'reflect-metadata';
import { ControllerFlowHandler } from './controller-flow.handler';
import { Container } from '../di';
import type { ExecutionContext, Guard } from '../interfaces';
import { MethodParamType, EventType } from '../enums';
import type { EventMetadata } from '../types';
import { GUARDS_METADATA_KEY } from '../constants';

class TestGuard implements Guard {
    canActivate(_context: ExecutionContext): boolean {
        return true;
    }
}

class DenyGuard implements Guard {
    canActivate(_context: ExecutionContext): boolean {
        return false;
    }
}

class DummyController {
    handle(player: unknown, payload: unknown) {
        return { player, payload };
    }
}

describe('ControllerFlowHandler – Guards', () => {
    let handler: ControllerFlowHandler;
    let container: Container;

    beforeEach(() => {
        container = new Container();
        container.register(TestGuard, new TestGuard());
        container.register(DenyGuard, new DenyGuard());
        handler = new ControllerFlowHandler(container);
    });

    function createMockHandler(guards: Array<new (...args: any[]) => Guard> = []): EventMetadata {
        Reflect.deleteMetadata(GUARDS_METADATA_KEY, DummyController.prototype, 'handle');
        if (guards.length) {
            Reflect.defineMetadata(GUARDS_METADATA_KEY, guards, DummyController.prototype, 'handle');
        }
        return {
            type: EventType.ON,
            name: 'test:event',
            methodName: 'handle',
            guards,
            params: [
                { index: 0, type: MethodParamType.PLAYER, data: undefined },
                { index: 1, type: MethodParamType.PAYLOAD, data: undefined },
            ],
            target: DummyController,
            method: DummyController.prototype.handle,
        } as unknown as EventMetadata;
    }

    function createContext(args: unknown[], methodName: string): ExecutionContext {
        return {
            name: 'test:event',
            args,
            payload: args[1],
            player: args[0],
            getClass: () => DummyController,
            getHandler: () => (DummyController.prototype as any)[methodName],
            getPlayer: () => args[0],
        };
    }

    it('should allow when no guards defined', async () => {
        const meta = createMockHandler();
        const ctx = createContext(['p', 'd'], meta.methodName);

        const ok = await handler.canActivate(ctx);
        expect(ok).toBe(true);
    });

    it('should resolve args and pass when guard returns true', async () => {
        const meta = createMockHandler([TestGuard]);
        const args = ['player1', { data: 42 }];
        const ctx = createContext(args, meta.methodName);

        const resolved = handler.createArgs(ctx, meta);
        expect(resolved).toEqual(args);

        const ok = await handler.canActivate(ctx);
        expect(ok).toBe(true);
    });

    it('should deny when guard returns false', async () => {
        const meta = createMockHandler([DenyGuard]);
        const ctx = createContext(['player1', { data: 42 }], meta.methodName);

        const ok = await handler.canActivate(ctx);
        expect(ok).toBe(false);
    });

    it('should deny if any of multiple guards returns false', async () => {
        const meta = createMockHandler([TestGuard, DenyGuard, TestGuard]);
        const ctx = createContext(['p', 'd'], meta.methodName);

        expect(await handler.canActivate(ctx)).toBe(false);
    });

    it('should allow if all multiple guards return true', async () => {
        const meta = createMockHandler([TestGuard, TestGuard]);
        const ctx = createContext(['p', 'd'], meta.methodName);

        expect(await handler.canActivate(ctx)).toBe(true);
    });

    it('should deny when class-level guard denies', async () => {
        Reflect.defineMetadata(GUARDS_METADATA_KEY, [DenyGuard], DummyController);
        const meta = createMockHandler();
        const ctx = createContext(['p', 'd'], meta.methodName);

        expect(await handler.canActivate(ctx)).toBe(false);

        Reflect.deleteMetadata(GUARDS_METADATA_KEY, DummyController);
    });

    it('should combine class-level and method-level guards (all pass)', async () => {
        Reflect.defineMetadata(GUARDS_METADATA_KEY, [TestGuard], DummyController);
        const meta = createMockHandler([TestGuard]);
        const ctx = createContext(['p', 'd'], meta.methodName);

        expect(await handler.canActivate(ctx)).toBe(true);

        Reflect.deleteMetadata(GUARDS_METADATA_KEY, DummyController);
    });

    describe('wrapWithGuardsProxy', () => {
        it('should call the real method when guard allows', async () => {
            Reflect.defineMetadata(GUARDS_METADATA_KEY, [TestGuard], DummyController.prototype, 'handle');

            const instance = new DummyController();
            const proxied = handler.wrapWithGuardsProxy(instance, DummyController);
            const result = await (proxied as any).handle('p', 'd');
            expect(result).toEqual({ player: 'p', payload: 'd' });
        });

        it('should block method call when guard denies', async () => {
            Reflect.defineMetadata(GUARDS_METADATA_KEY, [DenyGuard], DummyController.prototype, 'handle');

            const instance = new DummyController();
            const spy = jest.spyOn(instance, 'handle');
            const proxied = handler.wrapWithGuardsProxy(instance, DummyController);
            const result = await (proxied as any).handle('p', 'd');
            expect(result).toBeUndefined();
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
