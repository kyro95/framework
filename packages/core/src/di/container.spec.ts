import { Container } from '../di';

describe('Container', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('should register and resolve a provider', () => {
        const token = 'TOKEN';
        const value = 'VALUE';
        expect(container.has(token)).toBe(false);
        container.register(token, value);
        expect(container.has(token)).toBe(true);
        expect(container.resolve(token)).toBe(value);
    });

    it('should throw when resolving an unregistered provider', () => {
        expect(() => container.resolve('UNKNOWN')).toThrow('No provider found for token "UNKNOWN".');
    });

    it('should allow overriding a provider and log a warning', () => {
        const token = 'TOKEN';
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        container.register(token, 'v1');
        container.register(token, 'v2');

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            `A provider with the token "${token}" is already registered. It will be overridden.`,
        );

        expect(container.resolve(token)).toBe('v2');
        consoleWarnSpy.mockRestore();
    });
});
