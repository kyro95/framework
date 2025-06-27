<p align="center">
	<img src="https://i.postimg.cc/vZr8prX3/logo-3.png" alt="Aurora Multiplayer" width="160" />
</p>

<p align="center">
Aurora Multiplayer (aurora-mp) is a powerful TypeScript framework that lets you write a single codebase for GTA servers and gamemodes on platforms like alt:V, RAGE MP, and FiveM.
</p>

<p align="center">
	<a href="https://www.npmjs.com/~aurora-mp" target="_blank"><img src="https://img.shields.io/npm/v/@aurora-mp/core.svg" alt="NPM Version" /></a>
	<a href="https://www.npmjs.com/~aurora-mp" target="_blank"><img src="https://img.shields.io/npm/l/@aurora-mp/core.svg" alt="Package License" /></a>
	<a href="https://discord.gg/Jv95ygPSNY" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

<p align="center">
	<a href="#"><img src="https://img.shields.io/badge/⚠️-Early%20Development-yellow?style=for-the-badge" alt="Early Development"/></a>
</p>

> This project is still in its infancy. It’s under active development, and not all platforms are supported yet.

## 🚀 Overview

Aurora Multiplayer abstracts away the differences between popular GTA multiplayer platforms (such as alt:V, FiveM, RAGE MP ...) so you can write one single, strongly-typed codebase that runs on all of them.
With built-in dependency injection, an event-driven architecture, and first-class TypeScript support, you spend less time wrestling with platform quirks and more time crafting immersive multiplayer experiences.

## 🔑 Key Features

- **Cross-Platform**  
  Write your game logic once and deploy it to alt:V, FiveM or RAGE MP, and any other supported runtimes without changing a single line of business code.

- **Modular Design**  
  Break your code into self-contained modules for core, client, server, and custom webviews—each managed by Aurora’s powerful module loader.

- **Event-Driven**  
  React to player actions, network events, and custom triggers via concise TypeScript decorators like `@OnEvent`, `@OnClient`, and `@OnWebview`.

- **Type-Safe APIs**  
  Enjoy fully-typed interfaces for all core services (dependency injection, configuration, logging, webviews), with autocomplete and compile-time checks.

- **Webview Integration**  
  Build rich in-game UIs using standard web technologies (HTML/CSS/JS) and communicate seamlessly with your server and client-side code.

## 🌍 Supported Platforms

Aurora Multiplayer currently provides first-class support for the following multiplayer platforms:

- **alt:V** (WIP) – A modern, high-performance GTA V multiplayer platform with strong TypeScript support.
- **FiveM** (Not yet) – Community-driven GTA V multiplayer mod with a massive ecosystem (experimental support via plugins).
- **RAGE MP** (WIP) – A widely-used modding platform for GTA V, praised for its stability and extensive feature set.
- **Other Runtimes** – Easily extendable: create adapters for any GTA multiplayer environment of your choice.

## 🛠️ Getting Started

[Documentation](https://docs.aurora-mp.dev) - WIP

## 🙏 Special Thanks

Aurora Multiplayer wouldn’t be possible without the inspiration and support from these amazing projects:

- [netjs](https://github.com/nestjs/nest)
- [altv-mango](https://github.com/altv-mango/altv-mango)
