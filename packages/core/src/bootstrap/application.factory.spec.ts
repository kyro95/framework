/**
 * Test suite for ApplicationFactory and Aurora Dependency Injection system.
 * Covers all behaviors: provider lookup, modules, globals, custom tokens, parameter decorators, event binding, error handling.
 */
import { Module, Controller, Injectable, Global, Inject } from '../decorators';
import { CONTROLLER_EVENTS_KEY, CONTROLLER_PARAMS_KEY } from '../constants';
import { EventType, MethodParamType, Scope } from '../enums';
import { IPlatformDriver } from '../interfaces';

import { ApplicationFactory } from './application.factory';

// Helpers for Parameter Decorators
const createParamDecoratorMock =
    (type: MethodParamType) =>
    (data?: string): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
        if (!propertyKey) return;
        const params = Reflect.getOwnMetadata(CONTROLLER_PARAMS_KEY, target, propertyKey) ?? [];
        params.push({ index: parameterIndex, type, data });
        Reflect.defineMetadata(CONTROLLER_PARAMS_KEY, params, target, propertyKey);
    };
const Player = createParamDecoratorMock(MethodParamType.PLAYER);
const Payload = createParamDecoratorMock(MethodParamType.PAYLOAD);
const Param = createParamDecoratorMock(MethodParamType.PARAM);

// Helpers for Event Decorators
const createEventDecoratorMock =
    (type: EventType) =>
    (eventName?: string): MethodDecorator =>
    (target, propertyKey) => {
        const handlers = Reflect.getMetadata(CONTROLLER_EVENTS_KEY, target.constructor) || [];
        handlers.push({
            name: eventName ?? String(propertyKey),
            methodName: String(propertyKey),
            type,
            params: [],
        });
        Reflect.defineMetadata(CONTROLLER_EVENTS_KEY, handlers, target.constructor);
    };
const OnMock = createEventDecoratorMock(EventType.ON);
const OnClientMock = createEventDecoratorMock(EventType.ON_CLIENT);

describe('ApplicationFactory', () => {
    let mockPlatformDriver: IPlatformDriver;

    beforeEach(() => {
        mockPlatformDriver = {
            on: jest.fn(),
            onClient: jest.fn(),
            emit: jest.fn(),
        };
    });

    // Suite 1: Basic Dependency Injection
    describe('Basic Dependency Injection', () => {
        it('injects a provider into a controller within the same module', async () => {
            @Injectable()
            class TestService {}
            @Controller()
            class TestController {
                constructor(public readonly service: TestService) {}
            }
            @Module({ providers: [TestService], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const controller = await app.get(TestController);
            const service = await app.get(TestService);

            expect(controller).toBeInstanceOf(TestController);
            expect(service).toBeInstanceOf(TestService);
            expect(controller.service).toBe(service);
        });

        it('injects a provider from an imported and exported module', async () => {
            @Injectable()
            class ExportedService {}
            @Module({ providers: [ExportedService], exports: [ExportedService] })
            class ExportedModule {}
            @Controller()
            class TestController {
                constructor(public readonly service: ExportedService) {}
            }
            @Module({ imports: [ExportedModule], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const controller = await app.get(TestController);

            expect(controller.service).toBeInstanceOf(ExportedService);
        });

        it('throws when injecting a non-exported provider', async () => {
            @Injectable()
            class PrivateService {}
            @Module({ providers: [PrivateService] })
            class PrivateModule {}
            @Controller()
            class TestController {
                constructor(public readonly service: PrivateService) {}
            }
            @Module({ imports: [PrivateModule], controllers: [TestController] })
            class TestModule {}

            await expect(ApplicationFactory.create(TestModule, mockPlatformDriver)).rejects.toThrow(
                `[AuroraDI] Cannot resolve dependency for token "PrivateService"`,
            );
        });

        it('injects a provider using a symbol token', async () => {
            const TOKEN = Symbol('MY_TOKEN');
            @Injectable()
            class MyService {}
            @Module({ providers: [{ provide: TOKEN, useClass: MyService }], exports: [TOKEN] })
            class ServiceModule {}
            @Controller()
            class TestController {
                constructor(@Inject(TOKEN) public readonly injected: MyService) {}
            }
            @Module({ imports: [ServiceModule], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);
            expect(ctrl.injected).toBeInstanceOf(MyService);
        });

        it('allows overriding a global provider by importing a module that exports a local provider', async () => {
            @Injectable()
            class ServiceA {
                name = 'global';
            }
            @Injectable()
            class ServiceB extends ServiceA {
                override name = 'local';
            }

            @Global()
            @Module({ providers: [ServiceA], exports: [ServiceA] })
            class GlobalModule {}

            @Module({ providers: [{ provide: ServiceA, useClass: ServiceB }], exports: [ServiceA] })
            class LocalModule {}

            @Controller()
            class TestController {
                constructor(public readonly a: ServiceA) {}
            }

            @Module({ imports: [LocalModule], controllers: [TestController] })
            class AppModule {}

            @Module({ imports: [AppModule, GlobalModule] })
            class RootModule {}

            const app = await ApplicationFactory.create(RootModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);
            expect(ctrl.a).toBeInstanceOf(ServiceB);
            expect(ctrl.a.name).toBe('local');
        });
    });

    // Suite 2: Provider Patterns
    describe('Provider Patterns', () => {
        it('injects a value using useValue', async () => {
            const CONFIG_TOKEN = 'CONFIG_OBJECT';
            const configValue = { url: 'http://localhost' };
            @Controller()
            class TestController {
                constructor(@Inject(CONFIG_TOKEN) public readonly config: any) {}
            }
            @Module({ providers: [{ provide: CONFIG_TOKEN, useValue: configValue }], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const controller = await app.get(TestController);

            expect(controller.config).toEqual(configValue);
        });

        it('injects using useClass with an abstract token (symbol)', async () => {
            // This pattern is required for interfaces/abstracts
            const IFooServiceToken = Symbol('IFooService');

            interface IFooService {
                foo(): string;
            }
            @Injectable()
            class RealFooService implements IFooService {
                foo() {
                    return 'bar';
                }
            }
            @Controller()
            class TestController {
                constructor(@Inject(IFooServiceToken) public readonly foo: IFooService) {}
            }
            @Module({
                providers: [{ provide: IFooServiceToken, useClass: RealFooService }],
                controllers: [TestController],
            })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);

            expect(ctrl.foo).toBeInstanceOf(RealFooService);
            expect(ctrl.foo.foo()).toBe('bar');
        });

        it('resolves transient providers with new instance each time', async () => {
            @Injectable({ scope: Scope.TRANSIENT })
            class MyService {}

            @Controller()
            class TestController {
                constructor(
                    public readonly a: MyService,
                    public readonly b: MyService,
                ) {}
            }
            @Module({ providers: [MyService], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);
            expect(ctrl.a).toBeInstanceOf(MyService);
            expect(ctrl.b).toBeInstanceOf(MyService);
            expect(ctrl.a).not.toBe(ctrl.b);
        });

        it('injects via useFactory with a dependency', async () => {
            const FACT_TOKEN = Symbol('FACT_TOKEN');

            @Injectable()
            class DepService {
                public count = 1;
            }

            @Controller()
            class TestController {
                constructor(@Inject(FACT_TOKEN) public readonly result: DepService) {}
            }

            @Module({
                providers: [
                    DepService,
                    {
                        provide: FACT_TOKEN,
                        useFactory: (dep: DepService) => {
                            dep.count *= 2;
                            return dep;
                        },
                        inject: [{ token: DepService }],
                    },
                ],
                controllers: [TestController],
            })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);

            expect(ctrl.result).toBeInstanceOf(DepService);
            expect(ctrl.result.count).toBe(2);
        });

        it('useFactory returns a singleton by default', async () => {
            const TOKEN = Symbol('SINGLETON_FACTORY');

            @Controller()
            class FirstController {
                constructor(@Inject(TOKEN) public readonly x: object) {}
            }
            @Controller()
            class SecondController {
                constructor(@Inject(TOKEN) public readonly y: object) {}
            }

            @Module({
                providers: [
                    {
                        provide: TOKEN,
                        useFactory: () => ({}),
                    },
                ],
                controllers: [FirstController, SecondController],
            })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const first = await app.get(FirstController);
            const second = await app.get(SecondController);

            expect(first.x).toBe(second.y); // même instance
        });

        it('factory supports optional dependencies', async () => {
            const MAIN = Symbol('MAIN');
            const OPTIONAL = Symbol('OPTIONAL');

            @Controller()
            class TestController {
                constructor(@Inject(MAIN) public readonly data: { opt?: number }) {}
            }

            @Module({
                providers: [
                    {
                        provide: MAIN,
                        useFactory: (opt?: number) => ({ opt }),
                        inject: [{ token: OPTIONAL, optional: true }],
                    },
                    // NOTE: on ne déclare pas OPTIONAL, donc ce token est introuvable
                ],
                controllers: [TestController],
            })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);

            expect(ctrl.data).toEqual({ opt: undefined });
        });
    });

    // Suite 3: Module Graphs and Cycles
    describe('Module graph and cycles', () => {
        it('throws on circular module dependencies', async () => {
            class ModuleA {}
            class ModuleB {}
            Module({ imports: [ModuleB] })(ModuleA);
            Module({ imports: [ModuleA] })(ModuleB);

            await expect(ApplicationFactory.create(ModuleA, mockPlatformDriver)).rejects.toThrow(
                'Circular dependency detected',
            );
        });

        it('supports diamond dependency (imported by two modules, but only resolved once)', async () => {
            @Injectable()
            class SharedService {}

            @Module({ providers: [SharedService], exports: [SharedService] })
            class SharedModule {}

            @Controller()
            class CtrlA {
                constructor(public readonly s: SharedService) {}
            }
            @Controller()
            class CtrlB {
                constructor(public readonly s: SharedService) {}
            }

            @Module({ imports: [SharedModule], controllers: [CtrlA] })
            class ModA {}
            @Module({ imports: [SharedModule], controllers: [CtrlB] })
            class ModB {}

            @Module({ imports: [ModA, ModB] })
            class Root {}

            const app = await ApplicationFactory.create(Root, mockPlatformDriver);
            const ctrlA = await app.get(CtrlA);
            const ctrlB = await app.get(CtrlB);
            expect(ctrlA.s).toBeInstanceOf(SharedService);
            expect(ctrlB.s).toBe(ctrlA.s);
        });
    });

    // Suite 4: Global Module Behavior
    describe('Global Module Behavior', () => {
        it('injects from a @Global module without explicit import', async () => {
            @Injectable()
            class GlobalService {}
            @Global()
            @Module({ providers: [GlobalService], exports: [GlobalService] })
            class GlobalAppModule {}
            @Controller()
            class TestController {
                constructor(public readonly service: GlobalService) {}
            }
            @Module({ controllers: [TestController] })
            class TestModule {}
            @Module({ imports: [GlobalAppModule, TestModule] })
            class RootModule {}

            const app = await ApplicationFactory.create(RootModule, mockPlatformDriver);
            const controller = await app.get(TestController);

            expect(controller.service).toBeInstanceOf(GlobalService);
        });

        it('overrides a global provider with a local import', async () => {
            @Injectable()
            class GlobalService {
                val = 'global';
            }
            @Injectable()
            class LocalService extends GlobalService {
                override val = 'local';
            }

            @Global()
            @Module({ providers: [GlobalService], exports: [GlobalService] })
            class GlobalModule {}

            @Module({ providers: [{ provide: GlobalService, useClass: LocalService }], exports: [GlobalService] })
            class LocalModule {}

            @Controller()
            class TestController {
                constructor(public readonly s: GlobalService) {}
            }

            @Module({ imports: [LocalModule], controllers: [TestController] })
            class AppModule {}

            @Module({ imports: [GlobalModule, AppModule] })
            class RootModule {}

            const app = await ApplicationFactory.create(RootModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);
            expect(ctrl.s).toBeInstanceOf(LocalService);
            expect(ctrl.s.val).toBe('local');
        });
    });

    // Suite 5: Error Handling
    describe('Error handling', () => {
        it('throws when getting a provider that does not exist', async () => {
            @Module({})
            class EmptyModule {}
            const app = await ApplicationFactory.create(EmptyModule, mockPlatformDriver);
            await expect(app.get('UNKNOWN_TOKEN')).rejects.toThrow(/could not be found/);
        });
    });

    // Suite 6: Application Lifecycle and Events
    describe('Application Lifecycle & Events', () => {
        it('calls platform driver "on" when start() is called', async () => {
            @Controller()
            class EventsController {
                @OnMock('playerConnect') onConnect() {}
            }
            @Module({ controllers: [EventsController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            expect(mockPlatformDriver.on).not.toHaveBeenCalled();
            await app.start();
            expect(mockPlatformDriver.on).toHaveBeenCalledTimes(1);
            expect(mockPlatformDriver.on).toHaveBeenCalledWith('playerConnect', expect.any(Function));
        });
    });

    // Suite 7: Event Parameter Injection
    describe('Event Parameter Injection', () => {
        it('injects @Player decorated param (full object)', async () => {
            const mockPlayer = { id: 1, name: 'Aurora' };
            const handlerSpy = jest.fn();
            @Controller()
            class TestController {
                @OnClientMock('test:event')
                onTest(@Player() player: any) {
                    handlerSpy(player);
                }
            }
            @Module({ controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            await app.start();
            const dispatcher = (mockPlatformDriver.onClient as jest.Mock).mock.calls[0][1];
            await dispatcher(mockPlayer, 'unused');
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer);
        });

        it('injects @Player("key") property', async () => {
            const mockPlayer = { id: 1, name: 'Aurora' };
            const handlerSpy = jest.fn();
            @Controller()
            class TestController {
                @OnClientMock('test:event')
                onTest(@Player('name') playerName: string) {
                    handlerSpy(playerName);
                }
            }
            @Module({ controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            await app.start();
            const dispatcher = (mockPlatformDriver.onClient as jest.Mock).mock.calls[0][1];
            await dispatcher(mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith('Aurora');
        });

        it('injects multiple decorated parameters in the correct order', async () => {
            const mockPlayer = { id: 2 };
            const mockPayload = { reason: 'testing', duration: 10 };
            const handlerSpy = jest.fn();
            @Controller()
            class TestController {
                @OnClientMock('test:event')
                testEvent(
                    @Payload('reason') reason: string,
                    @Player() player: any,
                    @Param('duration') duration: number,
                ) {
                    handlerSpy(reason, player, duration);
                }
            }
            @Module({ controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            await app.start();
            const dispatcher = (mockPlatformDriver.onClient as jest.Mock).mock.calls[0][1];
            await dispatcher(mockPlayer, mockPayload);
            expect(handlerSpy).toHaveBeenCalledWith('testing', mockPlayer, 10);
        });
    });

    // Suite 8: Provider Injection (not only in controller)
    describe('Provider-to-provider injection', () => {
        it('injects a provider inside another provider', async () => {
            @Injectable()
            class ServiceA {}
            @Injectable()
            class ServiceB {
                constructor(public readonly a: ServiceA) {}
            }
            @Controller()
            class TestController {
                constructor(public readonly b: ServiceB) {}
            }
            @Module({ providers: [ServiceA, ServiceB], controllers: [TestController] })
            class TestModule {}

            const app = await ApplicationFactory.create(TestModule, mockPlatformDriver);
            const ctrl = await app.get(TestController);
            expect(ctrl.b).toBeInstanceOf(ServiceB);
            expect(ctrl.b.a).toBeInstanceOf(ServiceA);
        });
    });

    // Future: Add more test cases for useFactory and async providers when supported.
});
