/**
 * Interface for a class that wishes to run logic after the application has been initialized.
 */
export interface OnAppInit {
    onAppInit(): void;
}

/**
 * Interface for a class that wishes to run logic after the application has start.
 */
export interface OnAppStarted {
    onAppStarted(): void;
}

/**
 * Interface for a class that wishes to run logic when the application is shutting down.
 * Useful for cleanup tasks like closing database connections.
 */
export interface OnAppShutdown {
    /**
     * Method called when the application receives a shutdown signal.
     * @param signal The signal that triggered the shutdown (e.g., 'SIGINT').
     */
    onAppShutdown(signal?: string): void;
}
