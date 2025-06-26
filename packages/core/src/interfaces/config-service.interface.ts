/**
 * The common interface for the configuration service.
 */
export interface IConfigService {
    /**
     * Gets a configuration value.
     * @template T The expected type of the value.
     * @param key The key of the configuration property.
     * @param defaultValue An optional default value if the key is not found.
     * @returns The configuration value, or the default value.
     */
    get<T = any>(key: string, defaultValue?: T): T;
}
