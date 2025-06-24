import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.ts'],
    rootDir: '.',
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.json',
            },
        ],
    },
    testPathIgnorePatterns: ['/node_modules/'],
};

export default config;
