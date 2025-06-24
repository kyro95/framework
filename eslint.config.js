import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
    {
        ignores: [
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
            'dist/',
            'node_modules/',
            '**/*.d.ts',
            '*.config.js',
            '*.config.ts',
            'eslint.config.js',
            'jest.config.ts',
            'tsup.config.ts',
            'vite.config.ts',
            'coverage/',
            'packages/*/dist/',
            'packages/*/build/',
            'tests/',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: { import: importPlugin },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['./tsconfig.json', './packages/*/tsconfig.json'],
                tsconfigRootDir: process.cwd(),
            },
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
                },
            },
        },
        rules: {
            'import/no-unresolved': 'error',
            'import/no-duplicates': 'error',
            'import/order': ['warn', { 'newlines-between': 'always' }],
        },
    },
];
