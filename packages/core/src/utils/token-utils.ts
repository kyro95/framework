/**
 * Returns a human-readable identifier for a DI token.
 * - If the token is a class constructor, returns its `name`.
 * - Otherwise, returns `String(token)`.
 *
 * @param token The injection token (constructor, string, symbol, or provider).
 * @returns A simple string name for use in logs or error messages.
 * @public
 */
export function getTokenName(token: unknown): string {
    return typeof token === 'function' ? token.name : String(token);
}

/**
 * Produces a detailed string representation of a DI token or provider definition.
 * - Class constructors → their `name`.
 * - Symbols → `symbol.toString()`.
 * - Provider objects:
 *   - If it has a `provide` key, recurses on that token.
 *   - If it has `useClass`, shows `[useClass: ClassName]`.
 *   - If it has `useValue`, shows `[useValue: <type>]`.
 * - Fallback → `String(token)`.
 *
 * @param token The injection token or provider object to stringify.
 * @returns A descriptive string for debugging or error output.
 * @public
 */
export function tokenToString(token: unknown): string {
    if (typeof token === 'function') {
        return token.name;
    }
    if (typeof token === 'symbol') {
        return token.toString();
    }
    if (token && typeof token === 'object') {
        if ('provide' in token) {
            return tokenToString((token as any).provide);
        }
        if ('useClass' in token) {
            return `[useClass: ${tokenToString((token as any).useClass)}]`;
        }
        if ('useValue' in token) {
            return `[useValue: ${typeof (token as any).useValue}]`;
        }
    }
    return String(token);
}
