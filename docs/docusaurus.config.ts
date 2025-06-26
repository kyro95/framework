import path from 'path';
import type { Config } from '@docusaurus/types';

const config: Config = {
    title: 'Aurora',
    url: 'https://your-site.com',
    baseUrl: '/',
    favicon: 'img/favicon.ico',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    i18n: { defaultLocale: 'en', locales: ['en'] },

    plugins: [
        /*[
            'docusaurus-plugin-typedoc',
            {
                entryPoints: ['../packages/core/src/index.ts'],
                tsconfig: './tsconfig.typedoc.json',
                // plugin: ['./typedoc-plugin.mjs'],
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                readme: 'none',
                indexFormat: 'table',
                disableSources: true,
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
                sidebar: { pretty: true },
                parametersFormat: 'table',
                enumMembersFormat: 'table',
                useCodeBlocks: true,
            },
        ],*/
        // Core
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'core',
                entryPoints: ['../packages/core/src/index.ts'],
                tsconfig: path.resolve(__dirname, 'tsconfig.typedoc.json'),
                out: 'docs/api/core',
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
            },
        ],
        // Client
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'client',
                entryPoints: ['../packages/client/src/index.ts'],
                tsconfig: path.resolve(__dirname, 'tsconfig.typedoc.json'),
                out: 'docs/api/client',
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
            },
        ],
        /*// Client
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'client',
                entryPoints: ['../packages/client/src/index.ts'],
                tsconfig: path.resolve(__dirname, 'tsconfig.typedoc.json'),
                out: 'api/client',
                //routeBasePath: 'api/client',
                //sidebar: { categoryLabel: 'Client API', position: 2 },
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
            },
        ],*/
    ],

    presets: [
        [
            '@docusaurus/preset-classic',
            {
                // blog: false,
                docs: {
                    sidebarPath: './sidebars.ts',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'Aurora',
            items: [
                // { type: 'docSidebar', sidebarId: 'tutorialSidebar', label: 'Docs', position: 'left' },
                {
                    type: 'docSidebar',
                    sidebarId: 'apiSidebar',
                    label: 'API',
                    position: 'left',
                    items: [
                        { to: '/api/core', label: 'Core' },
                        { to: '/api/client', label: 'Client' },
                    ],
                },
                { href: 'https://github.com/aurora-mp', label: 'GitHub', position: 'right' },
            ],
        },
        footer: { style: 'dark', copyright: `© ${new Date().getFullYear()} Aurora.` },
    },
};

export default config;
