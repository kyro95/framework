#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/commands/init.ts
var init_exports = {};
__export(init_exports, {
  default: () => Init
});
module.exports = __toCommonJS(init_exports);
var import_core = require("@oclif/core");
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_inquirer = __toESM(require("inquirer"));
var import_kleur = __toESM(require("kleur"));
var import_child_process = require("child_process");
var _Init = class _Init extends import_core.Command {
  async run() {
    const { flags } = await this.parse(_Init);
    const { template } = flags;
    const templatesDir = import_path.default.join(__dirname, "..", "..", "templates");
    const { projectName } = await import_inquirer.default.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: `my-${template}-app`,
        validate: (i) => i.trim().length > 0 ? true : "Name cannot be empty"
      }
    ]);
    const { destination } = await import_inquirer.default.prompt([
      {
        type: "input",
        name: "destination",
        message: "Destination directory:",
        default: projectName,
        validate: (i) => i.trim().length > 0 ? true : "Directory cannot be empty"
      }
    ]);
    const { packageManager } = await import_inquirer.default.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: ["npm", "yarn", "pnpm"],
        default: "npm"
      }
    ]);
    this.log();
    const { confirm } = await import_inquirer.default.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Create project "${projectName}" in "${destination}" using ${packageManager}?`,
        default: true
      }
    ]);
    if (!confirm) {
      this.log(import_kleur.default.yellow("Project creation aborted."));
      return;
    }
    const source = import_path.default.join(templatesDir, template);
    const target = import_path.default.resolve(process.cwd(), destination);
    if (!import_fs_extra.default.existsSync(source)) {
      this.error(`Template "${template}" not found at ${source}`);
    }
    import_core.ux.action.start(`Generating project in ${target}`);
    await import_fs_extra.default.copy(source, target, { overwrite: false, errorOnExist: true });
    import_core.ux.action.stop();
    this.log(import_kleur.default.green(`
\u2714 Project "${projectName}" created at ${target}
`));
    const pkgPath = import_path.default.join(target, "package.json");
    const pkg = await import_fs_extra.default.readJson(pkgPath);
    pkg.name = projectName;
    if (packageManager === "pnpm") {
      const workspaceYaml = `packages:
  - 'packages/*'
`;
      await import_fs_extra.default.writeFile(import_path.default.join(target, "pnpm-workspace.yaml"), workspaceYaml);
      delete pkg.workspaces;
    } else {
      pkg.workspaces = ["packages/*"];
      await import_fs_extra.default.remove(import_path.default.join(target, "pnpm-workspace.yaml"));
    }
    await import_fs_extra.default.writeJson(pkgPath, pkg, { spaces: 2 });
    const { installDeps } = await import_inquirer.default.prompt([
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies now?",
        default: false
      }
    ]);
    if (installDeps) {
      this.log(`
Installing dependencies with ${packageManager}...`);
      try {
        (0, import_child_process.execSync)(`${packageManager} install`, { cwd: target, stdio: "inherit" });
        this.log(import_kleur.default.green("\nDependencies installed.\n"));
      } catch {
        this.log(import_kleur.default.red("\nInstallation failed. Please run manually inside the project.\n"));
      }
    }
    this.log(`Next steps: 

${import_kleur.default.cyan(`cd ${destination}`)}`);
    if (installDeps) {
      this.log(`
${import_kleur.default.cyan(`${packageManager} run dev`)}`);
    } else {
      this.log(`
${import_kleur.default.cyan(`${packageManager} install`)}`);
      this.log(`${import_kleur.default.cyan(`${packageManager} run dev`)}`);
    }
  }
};
_Init.description = "Initialize a new @aurora-mp project from a platform template. (WIP)";
_Init.flags = {
  template: import_core.Flags.string({
    char: "t",
    description: "Which platform template to use",
    options: ["altv", "ragemp"],
    default: "ragemp"
  })
};
var Init = _Init;
//# sourceMappingURL=init.js.map