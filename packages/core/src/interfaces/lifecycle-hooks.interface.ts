/**
 * Interface for a class that wishes to run logic after the entire application has been bootstrapped.
 */
export interface OnApplicationBootstrap {
    /**
     * Method called once the application has fully started.
     */
    onApplicationBootstrap(): void;
}

/**
 * Interface for a class that wishes to run logic when the application is shutting down.
 * Useful for cleanup tasks like closing database connections.
 */
export interface OnApplicationShutdown {
    /**
     * Method called when the application receives a shutdown signal.
     * @param signal The signal that triggered the shutdown (e.g., 'SIGINT').
     */
    onApplicationShutdown(signal?: string): void;
}
