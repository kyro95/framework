import { IApplication, ILogger, IPlatformDriver, OnApplicationBootstrap, OnApplicationShutdown } from '../interfaces';
import {
    MODULE_METADATA_KEY,
    GLOBAL_MODULE_KEY,
    INJECT_TOKEN_KEY,
    PLATFORM_DRIVER,
    LOGGER_SERVICE,
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
    private started = false;
    private closed = false;

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
            this.logger.warn('[AuroraDI] Application already started.');
            return;
        }

        this.started = true;
        this.logger.info('[AuroraDI] Starting application and binding events.');

        await this.instantiateControllers();
        this.bindControllerEvents();

        this.logger.info('[AuroraDI] Application started and listening for events.');
    }

    /**
     * Shuts down the application and calls shutdown hooks.
     */
    public async close(signal?: string): Promise<void> {
        if (this.closed) {
            this.logger.warn('[AuroraDI] Application already closed.');
            return;
        }

        this.closed = true;
        this.logger.info(`[AuroraDI] Closing application (signal: ${signal})`);

        await this.callLifecycle('onApplicationShutdown', signal as unknown);

        this.logger.info('[AuroraDI] Application closed');
    }

    /**
     * Resolves an instance from the DI container.
     * @param token The provider token or class
     */
    public async get<T>(token: Token<T>): Promise<T> {
        if (!this.instanceContainer.has(token)) {
            throw new Error(
                `[AuroraDI] Provider for token "${getTokenName(token)}" could not be found in the application context.`,
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
        console.log('\n[AuroraDI] - Initializing application -');

        await this.scanModules(rootModuleType);
        this.logModulesTree();
        await this.instantiateControllers();

        // Set logger if a custom LOGGER_SERVICE is present
        if (this.instanceContainer.has(LOGGER_SERVICE)) {
            this.logger = this.instanceContainer.resolve(LOGGER_SERVICE);
        }

        await this.callLifecycle('onApplicationBootstrap');

        this.registerShutdownListeners();
        this.logger.info('[AuroraDI] Application initialized successfully.');
    }

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
                `[AuroraDI] Circular dependency detected in module imports: ${moduleType.name} is part of a cycle.`,
            );
        }
        seen.add(moduleType);

        if (this.moduleWrappers.has(moduleType)) {
            return this.moduleWrappers.get(moduleType)!;
        }

        const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, moduleType);
        if (!metadata)
            throw new Error(`[AuroraDI] Class ${moduleType.name} is not a valid module. Did you forget @Module()?`);

        const moduleWrapper = new ModuleWrapper(moduleType, metadata);
        this.moduleWrappers.set(moduleType, moduleWrapper);

        // Register @Global modules
        if (Reflect.getMetadata(GLOBAL_MODULE_KEY, moduleType)) {
            this.globalModules.add(moduleWrapper);
            console.log(`[AuroraDI] Module '${moduleType.name}' marked as @Global`);
        }

        // Debug: print module structure
        console.log(`[AuroraDI] Scanning module '${moduleType.name}':`);
        console.log(`  imports:   ${(metadata.imports ?? []).map((x) => x.name).join(', ')}`);
        console.log(`  providers: ${(metadata.providers ?? []).map((x) => tokenToString(x)).join(', ')}`);
        console.log(`  exports:   ${(metadata.exports ?? []).map((x) => tokenToString(x)).join(', ')}`);
        console.log(`  controllers: ${(metadata.controllers ?? []).map((x) => x.name).join(', ')}`);

        // Recursively scan all imports
        for (const importedType of metadata.imports ?? []) {
            const importedModuleWrapper = await this.scanModules(importedType, new Set(seen));
            moduleWrapper.addImport(importedModuleWrapper);
        }
        return moduleWrapper;
    }

    /**
     * Prints the module graph in a tree format (debug/dev only).
     */
    private logModulesTree(): void {
        console.log('\n[AuroraDI] - Modules tree -');
        for (const [type, wrapper] of this.moduleWrappers.entries()) {
            const meta = wrapper.metadata;
            console.log(`- ${type.name}${this.globalModules.has(wrapper) ? ' [GLOBAL]' : ''}`);
            if (meta.imports?.length) console.log(`    imports: ${meta.imports.map((x) => x.name).join(', ')}`);
            if (meta.exports?.length)
                console.log(`    exports: ${meta.exports.map((x) => tokenToString(x)).join(', ')}`);
            if (meta.providers?.length)
                console.log(`    providers: ${meta.providers.map((x) => tokenToString(x)).join(', ')}`);
            if (meta.controllers?.length)
                console.log(`    controllers: ${meta.controllers.map((x) => x.name).join(', ')}`);
        }
        console.log('[AuroraDI] - End tree -\n');
    }

    private async callLifecycle<K extends keyof OnApplicationBootstrap | keyof OnApplicationShutdown>(
        hook: K,
        ...args: unknown[]
    ): Promise<void> {
        for (const wrapper of this.moduleWrappers.values()) {
            for (const ctrlType of wrapper.controllers) {
                const instance = this.instanceContainer.resolve(ctrlType) as any;
                const fn = instance[hook] as Function | undefined;
                if (typeof fn === 'function') {
                    this.logger.debug?.(`[AuroraDI] Calling ${hook} on ${ctrlType.name}`);
                    await fn.apply(instance, args);
                }
            }
        }
    }

    /**
     * Instantiates all controllers in all modules (triggers provider resolution for dependencies).
     */
    private async instantiateControllers(): Promise<void> {
        for (const moduleWrapper of this.moduleWrappers.values()) {
            for (const controller of moduleWrapper.controllers) {
                console.log(
                    `[AuroraDI] Instantiating controller '${controller.name}' from module '${moduleWrapper.type.name}'`,
                );
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
                        `[AuroraDI] Could not resolve dependency for ${targetClass.name} at param index ${index}.`,
                    );
                console.log(
                    `[AuroraDI]  [instantiateClass] Resolving dependency [${index}] for '${targetClass.name}': token = '${getTokenName(token)}'`,
                );
                return this.resolveDependency(token, contextModule);
            }),
        );

        console.log(`[AuroraDI] [instantiateClass] Instantiated '${targetClass.name}'`);
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
            console.log(`[AuroraDI] [resolveDependency] Token '${getTokenName(token)}' already instantiated.`);
            return this.instanceContainer.resolve(token);
        }
        if (seen.has(token)) {
            throw new Error(`[AuroraDI] Circular dependency detected for token "${getTokenName(token)}".`);
        }
        seen.add(token);

        console.log(
            `[AuroraDI] [resolveDependency] Resolving token '${getTokenName(token)}' in module '${contextModule.type.name}'`,
        );

        const destinationModule = this.findModuleByProvider(token, contextModule);
        if (!destinationModule) {
            console.error(
                `[AuroraDI] [resolveDependency] Failed to resolve token '${getTokenName(token)}'. Searched from module '${contextModule.type.name}'`,
            );
            throw new Error(
                `[AuroraDI] Cannot resolve dependency for token "${getTokenName(token)}". Make sure the provider is part of a module and is exported if used in another module.`,
            );
        }

        console.log(
            `[AuroraDI] [resolveDependency] Found token '${getTokenName(token)}' in module '${destinationModule.type.name}'`,
        );

        const providerDefinition = this.findProviderDefinition(token, destinationModule);
        if (!providerDefinition) {
            console.error(
                `[AuroraDI] [resolveDependency] Provider definition missing for token '${getTokenName(token)}' in module '${destinationModule.type.name}'`,
            );
            throw new Error(
                `[AuroraDI] Internal Error: Could not find provider definition for token "${getTokenName(token)}".`,
            );
        }

        const { useClass, useValue } = normalizeProvider(providerDefinition);
        let instance: unknown;
        const scope = getProviderScope(providerDefinition);

        if (useValue !== undefined) {
            instance = useValue;
            this.instanceContainer.register(token, instance);
            console.log(`[AuroraDI] [resolveDependency] Registered instance for token '${getTokenName(token)}'`);
            return instance;
        }

        if (scope === Scope.SINGLETON) {
            instance = await this.instantiateClass(useClass!, destinationModule);
            this.instanceContainer.register(token, instance);
            console.log(`[AuroraDI] [resolveDependency] Registered instance for token '${getTokenName(token)}'`);
            return instance;
        }

        instance = await this.instantiateClass(useClass!, destinationModule);
        console.log(`[AuroraDI] [resolveDependency] Transient instance created for token '${getTokenName(token)}'`);
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
