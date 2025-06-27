import path from 'path';
import type { Config } from '@docusaurus/types';

const config: Config = {
    title: '@aurora-mp',
    url: 'https://aurora-mp.netlify.app/',
    baseUrl: '/',
    favicon: 'img/favicon.ico',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    i18n: { defaultLocale: 'en', locales: ['en'] },

    plugins: [
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
                disableSources: true,
                tableColumnSettings: {
                    hideSources: true,
                },
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
                disableSources: true,
                tableColumnSettings: {
                    hideSources: true,
                },
            },
        ],
        // Server
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'server',
                entryPoints: ['../packages/server/src/index.ts'],
                tsconfig: path.resolve(__dirname, 'tsconfig.typedoc.json'),
                out: 'docs/api/server',
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
                disableSources: true,
                tableColumnSettings: {
                    hideSources: true,
                },
            },
        ],
        // Webview
        [
            'docusaurus-plugin-typedoc',
            {
                id: 'webview',
                entryPoints: ['../packages/webview/src/index.ts'],
                tsconfig: path.resolve(__dirname, 'tsconfig.typedoc.json'),
                out: 'docs/api/webview',
                plugin: ['typedoc-plugin-markdown'],
                theme: 'markdown',
                categorizeByGroup: true,
                groupOrder: ['Classes', 'Interfaces', 'Enums'],
                disableSources: true,
                tableColumnSettings: {
                    hideSources: true,
                },
            },
        ],
    ],

    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    path: 'docs',
                    routeBasePath: '/',
                    sidebarPath: require.resolve('./sidebars.js'),
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],

    themeConfig: {
        navbar: {
            title: '@aurora-mp',
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    label: 'Docs',
                    position: 'left',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'apiSidebar',
                    label: 'API',
                    position: 'left',
                    items: [
                        { to: '/api/core', label: 'Core' },
                        { to: '/api/server', label: 'Server' },
                        { to: '/api/client', label: 'Client' },
                        { to: '/api/webview', label: 'Webview' },
                    ],
                },
                {
                    href: 'https://github.com/aurora-mp/framework',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: { style: 'dark', copyright: `© ${new Date().getFullYear()} @aurora-mp.` },
    },
};

export default config;
