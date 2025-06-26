/**
 * The contract for a service that can load configuration data.
 */
export interface IConfigLoader {
    /**
     * Loads and parses the configuration source (e.g., a .env file).
     * @returns A record containing the configuration key-value pairs.
     */
    load(): Record<string, string>;
}
