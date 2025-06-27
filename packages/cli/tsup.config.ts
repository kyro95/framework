import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/commands/**/*.ts'],
    outDir: 'bin',
    format: ['cjs'],
    platform: 'node',
    target: 'node14',
    dts: true,
    sourcemap: true,
    clean: true,
    banner: {
        js: '#!/usr/bin/env node',
    },
});
