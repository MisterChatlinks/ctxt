#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src-cli/index.ts
import { cwd } from "process";

// src-cli/inquire.ts
import inquirer from "inquirer";

// var.ts
var RuntimeFileName = "monitext.runtime";
var PackageName = "monitor-txt";
var defaultApiKeyPlaceholder = "<YOUR_API_KEY>";
var defaultProjectNamePlaceholder = "<YOUR_PROJECT_NAME>";

// src-cli/inquire.ts
function mkPrompt(name, param) {
  const result = __spreadValues({ name }, param);
  return result;
}
function mkSimplePrompt(name, param) {
  const result = __spreadValues({ name }, param);
  return result;
}
async function inquireMonitextRuntime() {
  const answers = await inquirer.prompt([
    mkSimplePrompt("flavor", {
      message: "What flavor of monitext do need wish for ?",
      type: "list",
      choices: [".ts", ".js", ".cjs"]
    }),
    mkPrompt("project_name", {
      message: "What is your project name?",
      type: "input",
      default: defaultProjectNamePlaceholder
    }),
    mkPrompt("apiKey", {
      message: "Enter your API key (or leave blank to input it later):",
      type: "input",
      default: defaultApiKeyPlaceholder
    }),
    mkPrompt("env", {
      message: "In which environment are you running Monitext?",
      type: "list",
      choices: ["web", "node", "deno"]
    }),
    mkPrompt("format", {
      message: `Which logging format do you want (recommended: "dev")?`,
      type: "list",
      choices: [
        { name: "dev - readable output for humans (default)", value: "dev" },
        { name: "json - structured data for parsing", value: "json" },
        { name: "compact - short single-line logs", value: "compact" }
      ],
      default: "dev"
    }),
    mkPrompt("devMode", {
      message: "Activate Dev Mode (logs won't be sent to API)?",
      type: "confirm",
      default: false
    }),
    mkPrompt("silent", {
      message: "Silence specific log levels? (comma separated, e.g. info,success,error)",
      type: "input",
      default: ""
    })
  ]);
  if (typeof answers.silent === "string") {
    answers.silent = answers.silent.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return answers;
}

// src-cli/write.ts
import { writeFileSync as writeFileSync2 } from "fs";
import { join as join2 } from "path";

// src-cli/alias.ts
import { existsSync } from "fs";
import { join } from "path";
import { writeFileSync, readFileSync } from "fs";

// src/utils/jsonFormat.ts
function jsonFormat(obj, indent = 3) {
  return JSON.stringify(obj, null, indent);
}

// src-cli/alias.ts
function injectPathAliasIfPossible(root, runtimeFile) {
  const relPath = "./" + runtimeFile;
  const alias = "#monitext-runtime";
  const pkgJsonPath = join(root, "package.json");
  if (existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    pkg.imports = pkg.imports || {};
    pkg.imports[alias] = relPath;
    writeFileSync(pkgJsonPath, jsonFormat(pkg), "utf-8");
    console.log("\u2705 Added monitext/runtime to package.json 'imports'");
  }
  const tsconfigPath = join(root, "tsconfig.json");
  if (existsSync(tsconfigPath)) {
    const ts = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
    ts.compilerOptions = ts.compilerOptions || {};
    ts.compilerOptions.paths = ts.compilerOptions.paths || {};
    ts.compilerOptions.paths[alias] = [relPath];
    writeFileSync(tsconfigPath, jsonFormat(ts), "utf-8");
    console.log("\u2705 Added monitext/runtime to tsconfig.json 'paths'");
  }
  const denoConfigPath = join(root, "deno.json");
  if (existsSync(denoConfigPath)) {
    const deno = JSON.parse(readFileSync(denoConfigPath, "utf-8"));
    deno.imports = deno.imports || {};
    deno.imports[alias] = relPath;
    writeFileSync(denoConfigPath, jsonFormat(deno), "utf-8");
    console.log("\u2705 Added monitext/runtime to deno.json 'imports'");
  }
}

// src-cli/write.ts
function writeMonitextRuntime(at, config, type) {
  const inputConf = jsonFormat(config);
  const inputTemplate = (templateConf) => {
    switch (type) {
      case ".cjs":
        return [
          `const defineMonitextRuntime = require("${PackageName}").default`,
          `const { mtxt, monitext } = defineMonitextRuntime(${templateConf})`,
          `module.exports = { mtxt, monitext }`
        ].join("\n");
      default:
        return [
          `import defineMonitextRuntime from "${PackageName}"`,
          `export const { mtxt, monitext } = defineMonitextRuntime(${templateConf})`
        ].join("\n");
    }
  };
  const baseFile = RuntimeFileName;
  const runtimeFile = `${baseFile}${type}`;
  const runtimePath = join2(at, runtimeFile);
  writeFileSync2(runtimePath, inputTemplate(inputConf), { encoding: "utf-8" });
  try {
    injectPathAliasIfPossible(at, runtimeFile);
  } catch (e) {
    console.warn("Could not inject path alias automatically:", e.message, e.stack);
  }
}

// src-cli/index.ts
var path = cwd();
(async () => {
  const config = await inquireMonitextRuntime();
  const param = __spreadValues({}, config);
  delete param["flavor"];
  writeMonitextRuntime(path, param, config.flavor);
})();
