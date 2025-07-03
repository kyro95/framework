import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');
const rootPackageJson = require('../../package.json');

console.log('🔨 Building server ...');
console.log('📦 Using package.json:', packageJson.name);
console.log('📦 Using root package.json:', rootPackageJson.name);

const config = {
    entryPoints: ['src/index.ts'],
    outfile: '../../server-data/resources/[local]/aurora-mp/server.js',
    bundle: true,
    platform: 'node',
    target: 'node16',
    format: 'esm',
    sourcemap: false,
    keepNames: true,
    minify: false,
    logLevel: 'warning',
    plugins: [esbuildPluginTsc()],
    external: [
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(rootPackageJson.devDependencies || {}),
    ],
};

await esbuild.build(config);
