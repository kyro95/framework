import { Injectable, Inject, type IConfigService, type IConfigLoader, CONFIG_LOADER } from '@aurora-mp/core';

/**
 * Service responsible for loading and providing access to application configuration.
 * The configuration is loaded once at construction time via the injected loader.
 */
@Injectable()
export class ConfigService implements IConfigService {
    /**
     * Internal storage for configuration key/value pairs.
     */
    private readonly config: Record<string, string> = {};

    /**
     * Creates an instance of ConfigService.
     * @param loader - The platform-specific configuration loader.
     *                 It should implement IConfigLoader.load() to return a map of config values.
     */
    constructor(
        @Inject(CONFIG_LOADER)
        private readonly loader: IConfigLoader,
    ) {
        // Load all configuration values at startup.
        this.config = this.loader.load();
    }

    /**
     * Retrieves a configuration value by key, optionally casting it to the type of a default value.
     *
     * @typeParam T - The expected return type.
     * @param key - The configuration key to look up.
     * @param defaultValue - An optional default value to return if the key is not found.
     * @returns The configuration value cast to T, or the provided defaultValue.
     * @throws If the key is missing and no defaultValue is provided.
     */
    public get<T = any>(key: string, defaultValue?: T): T {
        const value = this.config[key];

        // If the key is not present in the config map...
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(
                    `[Aurora] Missing required configuration key: "${key}" and no default value was provided.`,
                );
            }
            // Return the default if provided.
            return defaultValue;
        }

        // Normalize boolean-like strings.
        const lowercasedValue = value.toLowerCase();
        if (lowercasedValue === 'true') {
            return true as T;
        }
        if (lowercasedValue === 'false') {
            return false as T;
        }

        // If a defaultValue was provided, attempt to cast to its type.
        if (defaultValue !== undefined) {
            // Numeric default: attempt to parse a float.
            if (typeof defaultValue === 'number') {
                const num = parseFloat(value);
                return (isNaN(num) ? defaultValue : num) as T;
            }
            // Boolean default (already handled above, but included for clarity).
            if (typeof defaultValue === 'boolean') {
                return (value === 'true') as T;
            }
        }

        // Otherwise, return the raw string.
        return value as T;
    }
}
