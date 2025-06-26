import {
    IApplication,
    IConfigService,
    ILogger,
    IPlatformDriver,
    OnAppInit,
    OnAppStarted,
    OnAppShutdown,
} from '../interfaces';
import {
    MODULE_METADATA_KEY,
    GLOBAL_MODULE_KEY,
    INJECT_TOKEN_KEY,
    PLATFORM_DRIVER,
    LOGGER_SERVICE,
    CONFIG_SERVICE,
} from '../constants';
import { ModuleWrapper, Container } from '../di';
import { ModuleMetadata, Provider, Token, Type } from '../types';
import { Scope } from '../enums';
import { getProviderScope, getTokenName, normalizeProvider, tokenToString } from '../utils';
import { ControllerFlowHandler } from './controller-flow.handler';
import { EventBinder } from './event-binder';

/**
 * Bootstraps and manages the full Aurora application lifecycle:
 * - Scans modules and builds the DI graph
 * - Instantiates controllers up front (to support lifecycle hooks)
 * - Binds controller events to the platform driver via EventBinder
 *
 * Use {@link ApplicationFactory.create} to initialize and obtain the application instance.
 * @category Core
 * @public
 */
export class ApplicationFactory {
    private readonly applicationRef: IApplication;
    private readonly moduleWrappers = new Map<Type, ModuleWrapper>();
    private readonly globalModules = new Set<ModuleWrapper>();
    private readonly instanceContainer = new Container();
    private readonly flowHandler = new ControllerFlowHandler();
    private readonly eventBinder: EventBinder;
    private logger: ILogger = console;
    private config?: IConfigService;

    private started = false;
    private closed = false;

    private debug: boolean = false;

    /**
     * @param platformDriver The platform driver for event binding/runtime APIs.
     * @internal
     */
    private constructor(private readonly platformDriver: IPlatformDriver) {
        this.instanceContainer.register(PLATFORM_DRIVER, this.platformDriver);
        this.eventBinder = new EventBinder(platformDriver, this.flowHandler);
        this.applicationRef = {
            start: this.start.bind(this),
            get: this.get.bind(this),
            close: this.close.bind(this),
        };
    }

    /**
     * Bootstraps an Aurora application and returns its public interface.
     * @param rootModule The application's root module (entry point)
     * @param platformDriver The platform driver for this runtime
     * @returns A Promise resolving to the IApplication instance
     */
    public static async create(rootModule: Type, platformDriver: IPlatformDriver): Promise<IApplication> {
        const factory = new ApplicationFactory(platformDriver);
        await factory.initialize(rootModule);
        return factory.applicationRef;
    }

    /**
     * Starts the application and binds all controller event handlers.
     */
    public async start(): Promise<void> {
        if (this.started) {
            this.logger.warn('[Aurora] Application already started.');
            return;
        }

        this.started = true;
        this.logger.info('[Aurora] Starting application and binding events.');

        // Binding controller events.
        this.bindControllerEvents();

        // Call lifecycle hooks and register shutdown listeners.
        await this.callLifecycle('onAppStarted');
        this.registerShutdownListeners();

        this.logger.info('[Aurora] Application started and listening for events.');
    }

    /**
     * Shuts down the application and calls shutdown hooks.
     */
    public async close(signal?: string): Promise<void> {
        if (this.closed) {
            this.logger.warn('[Aurora] Application already closed.');
            return;
        }

        this.closed = true;
        this.logger.info(`[Aurora] Closing application (signal: ${signal})`);

        await this.callLifecycle('onAppShutdown', signal as unknown);

        this.logger.info('[Aurora] Application closed');
    }

    /**
     * Resolves an instance from the DI container.
     * @param token The provider token or class
     */
    public async get<T>(token: Token<T>): Promise<T> {
        if (!this.instanceContainer.has(token)) {
            throw new Error(
                `[Aurora] Provider for token "${getTokenName(token)}" could not be found in the application context.`,
            );
        }
        return this.instanceContainer.resolve(token);
    }

    /**
     * Binds all controller events (decorated handlers) to the platform driver via EventBinder.
     */
    private bindControllerEvents(): void {
        const controllersWithInstances: [Type, Record<string, unknown>][] = [];
        for (const module of this.moduleWrappers.values()) {
            for (const controllerType of module.controllers) {
                controllersWithInstances.push([
                    controllerType,
                    this.instanceContainer.resolve(controllerType) as Record<string, unknown>,
                ]);
            }
        }
        this.eventBinder.bindControllerEvents(controllersWithInstances);
    }

    /**
     * Internal bootstrap: scans modules, builds the graph, and triggers instantiation.
     * @param rootModuleType The root module class
     * @internal
     */
    private async initialize(rootModuleType: Type): Promise<void> {
        // Scan all modules to build the dependency graph.
        await this.scanModules(rootModuleType);

        // Resolve and instantiate core services needed by the factory itself.
        const rootModule = this.moduleWrappers.get(rootModuleType)!;
        await this.initializeCoreServices(rootModule);

        if (this.debug) {
            this.logModulesTree();
        }

        // Instantiate all remaining providers and controllers.
        await this.instantiateModules();
        await this.callLifecycle('onAppInit');

        this.logger.info('[Aurora] Application initialized successfully.');
    }

    // TODO
    private registerShutdownListeners(): void {
        // process.on('SIGINT', async () => await this.close('SIGINT'));
        // process.on('SIGTERM', async () => await this.close('SIGTERM'));
    }

    /**
     * Recursively scans all modules, handles imports/exports and registers global modules.
     */
    private async scanModules(moduleType: Type, seen: Set<Type> = new Set()): Promise<ModuleWrapper> {
        if (seen.has(moduleType)) {
            throw new Error(
                `[Aurora] Circular dependency detected in module imports: ${moduleType.name} is part of a cycle.`,
            );
        }

        seen.add(moduleType);

        if (this.moduleWrappers.has(moduleType)) {
            return this.moduleWrappers.get(moduleType)!;
        }

        const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, moduleType);
        if (!metadata)
            throw new Error(`[Aurora] Class ${moduleType.name} is not a valid module. Did you forget @Module()?`);

        const moduleWrapper = new ModuleWrapper(moduleType, metadata);
        this.moduleWrappers.set(moduleType, moduleWrapper);

        // Register @Global modules
        if (Reflect.getMetadata(GLOBAL_MODULE_KEY, moduleType)) {
            this.globalModules.add(moduleWrapper);
        }

        // Recursively scan all imports
        for (const importedType of metadata.imports ?? []) {
            const importedModuleWrapper = await this.scanModules(importedType, new Set(seen));
            moduleWrapper.addImport(importedModuleWrapper);
        }
        return moduleWrapper;
    }

    /**
     * Eagerly instantiates and assigns core services like Logger and Config.
     */
    private async initializeCoreServices(rootModule: ModuleWrapper): Promise<void> {
        if (this.instanceContainer.has(CONFIG_SERVICE)) {
            try {
                this.config = (await this.resolveDependency(CONFIG_SERVICE, rootModule)) as IConfigService;
                this.debug = this.config.get<boolean>('DEBUG', false);
            } catch (e) {
                this.logger.warn(
                    `[Aurora] CONFIG_SERVICE not found or failed to load. Debug logging will be disabled.`,
                );
            }
        }

        try {
            this.logger = (await this.resolveDependency(LOGGER_SERVICE, rootModule)) as ILogger;
        } catch (e) {
            this.logger.warn(`[Aurora] LOGGER_SERVICE not found. Falling back to console logging.`);
        }
    }

    /**
     * Prints the module graph in a tree format (debug/dev only).
     */
    private logModulesTree(): void {
        this.logger.debug('[Aurora] Modules tree');

        for (const [type, wrapper] of this.moduleWrappers.entries()) {
            const meta = wrapper.metadata;

            this.logger.debug(`- ${type.name}${this.globalModules.has(wrapper) ? ' [GLOBAL]' : ''}`);

            if (meta.imports?.length) this.logger.debug(`    imports: ${meta.imports.map((x) => x.name).join(', ')}`);
            if (meta.exports?.length)
                this.logger.debug(`    exports: ${meta.exports.map((x) => tokenToString(x)).join(', ')}`);
            if (meta.providers?.length)
                this.logger.debug(`    providers: ${meta.providers.map((x) => tokenToString(x)).join(', ')}`);
            if (meta.controllers?.length)
                this.logger.debug(`    controllers: ${meta.controllers.map((x) => x.name).join(', ')}`);
        }

        this.logger.debug('[Aurora] End tree\n');
    }

    private async callLifecycle<K extends keyof OnAppInit | keyof OnAppStarted | keyof OnAppShutdown>(
        hook: K,
        ...args: unknown[]
    ): Promise<void> {
        for (const wrapper of this.moduleWrappers.values()) {
            for (const ctrlType of wrapper.controllers) {
                const instance = this.instanceContainer.resolve(ctrlType) as any;
                const fn = instance[hook] as Function | undefined;
                if (typeof fn === 'function') {
                    this.logger.debug(`[Aurora] Calling ${hook} on ${ctrlType.name}.`);
                    await fn.apply(instance, args);
                }
            }
        }
    }

    private async instantiateModules(): Promise<void> {
        for (const moduleWrapper of this.moduleWrappers.values()) {
            for (const provider of moduleWrapper.metadata.providers ?? []) {
                await this.resolveDependency(normalizeProvider(provider).provide, moduleWrapper);
            }

            for (const controller of moduleWrapper.controllers) {
                await this.resolveDependency(controller, moduleWrapper);
            }
        }
    }

    /**
     * Instantiates a class, injecting constructor dependencies.
     * Note: Cannot infer instance type from Type, using 'unknown'.
     * @param targetClass The class to instantiate
     * @param contextModule The module providing DI context
     */
    private async instantiateClass(targetClass: Type, contextModule: ModuleWrapper): Promise<unknown> {
        const paramTypes: (Type | undefined)[] = Reflect.getMetadata('design:paramtypes', targetClass) || [];
        const customTokens: (Token | undefined)[] = Reflect.getOwnMetadata(INJECT_TOKEN_KEY, targetClass) || [];

        const dependencies = await Promise.all(
            paramTypes.map(async (param, index) => {
                const token = customTokens[index] || param;
                if (!token)
                    throw new Error(
                        `[Aurora] Could not resolve dependency for ${targetClass.name} at param index ${index}.`,
                    );

                return this.resolveDependency(token, contextModule);
            }),
        );

        return new targetClass(...dependencies);
    }

    /**
     * Resolves a provider (controller/service) in the DI graph, including global modules.
     * @param token The token/class to resolve
     * @param contextModule The module to start searching from
     * @param seen (Cycle detection)
     */
    private async resolveDependency(
        token: Token,
        contextModule: ModuleWrapper,
        seen: Set<Token> = new Set(),
    ): Promise<unknown> {
        if (this.instanceContainer.has(token)) {
            return this.instanceContainer.resolve(token);
        }
        if (seen.has(token)) {
            throw new Error(`[Aurora] Circular dependency detected for token "${getTokenName(token)}".`);
        }
        seen.add(token);

        const destinationModule = this.findModuleByProvider(token, contextModule);
        if (!destinationModule) {
            this.logger.error(
                `[Aurora] [resolveDependency] Failed to resolve token '${getTokenName(token)}'. Searched from module '${contextModule.type.name}'`,
            );
            throw new Error(
                `[Aurora] Cannot resolve dependency for token "${getTokenName(token)}". Make sure the provider is part of a module and is exported if used in another module.`,
            );
        }

        const providerDefinition = this.findProviderDefinition(token, destinationModule);
        if (!providerDefinition) {
            this.logger.error(
                `[Aurora] [resolveDependency] Provider definition missing for token '${getTokenName(token)}' in module '${destinationModule.type.name}'`,
            );
            throw new Error(
                `[Aurora] Internal Error: Could not find provider definition for token "${getTokenName(token)}".`,
            );
        }

        const { useClass, useValue } = normalizeProvider(providerDefinition);
        let instance: unknown;
        const scope = getProviderScope(providerDefinition);

        if (useValue !== undefined) {
            instance = useValue;
            this.instanceContainer.register(token, instance);
            return instance;
        }

        if (scope === Scope.SINGLETON) {
            instance = await this.instantiateClass(useClass!, destinationModule);
            this.instanceContainer.register(token, instance);
            return instance;
        }

        instance = await this.instantiateClass(useClass!, destinationModule);
        return instance;
    }

    /**
     * Finds the module able to provide the given token.
     * 1. Current module (providers/controllers)
     * 2. Imported modules (recursive, if they export the token)
     * 3. All global modules (@Global)
     */
    private findModuleByProvider(token: Token, contextModule: ModuleWrapper): ModuleWrapper | undefined {
        if (this.findProviderDefinition(token, contextModule)) {
            return contextModule;
        }

        for (const importedModule of contextModule.imports) {
            if (importedModule.exports.has(token)) {
                return this.findModuleByProvider(token, importedModule);
            }
        }

        for (const globalModule of this.globalModules) {
            if (globalModule.exports.has(token) && this.findProviderDefinition(token, globalModule)) {
                return globalModule;
            }
        }

        return undefined;
    }

    /**
     * Finds a provider definition for a token in a given module, including controllers.
     */
    private findProviderDefinition(token: Token, moduleWrapper: ModuleWrapper): Provider | Type | undefined {
        if (moduleWrapper.controllers.has(token as Type)) {
            return token as Type;
        }

        return moduleWrapper.metadata.providers?.find((provider) => {
            const normalized = normalizeProvider(provider);
            return normalized.provide === token;
        });
    }
}
