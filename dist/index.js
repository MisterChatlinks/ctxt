"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// ctxtconfig.ts
var config = {
  "project_name": "",
  "env": "node",
  "handleException": true,
  "handleRejection": true,
  "include": [
    "src/*"
  ],
  "devMode": true,
  "apiKey": "<YOUR_API_KEY>"
};
var ctxtconfig_default = config;

// src/ctxt.ts
var import_process = require("process");

// src/utils.ts
function lockUpInStack(at) {
  let anchor = Error().stack?.split("\n").map((str) => str.trim());
  if (!at) {
    return anchor;
  }
  if (at && typeof at != "number") {
    console.warn("invalid argument passed to lockUpInStack, expecting a number");
    return null;
  }
  if (!anchor[at]) {
    console.warn("invalid `at` index passed to lockUpInStack");
    return null;
  }
  return anchor[at];
}

// src/config.ts
var CTXTConfigObj = class {
  "apiKey" = null;
  "exclude" = [];
  "include" = ["*"];
  "send" = ["error", "fatal", "info", "success", "warn"];
  "silentInDev" = false;
  "silentInProd" = true;
};
function CTXTConfig(option) {
  const shalowConfig = new CTXTConfigObj();
  for (const key in option) {
    if (!(key in shalowConfig)) {
      console.warn(`Unknown key \`${key}\` passed in CTXTConfig`);
    }
  }
  const {
    apiKey,
    exclude,
    include,
    send,
    silentInDev,
    silentInProd
  } = option;
  if (apiKey) {
    shalowConfig.apiKey = option.apiKey;
  }
  return shalowConfig;
}

// src/ctxt.ts
var ctxt = class _ctxt {
  static ConfigCache;
  entryCounter = {};
  static init(config2) {
    this.ConfigCache = config2;
  }
  /**
   * Get and cache ctxt config
   */
  getConfig() {
    if (_ctxt.ConfigCache !== void 0) return _ctxt.ConfigCache;
    return CTXTConfig({});
  }
  /**
   * Track how many times a log has been triggered at a specific location
   */
  registerLogEntry(anchor, level) {
    const key = `${level}:${anchor}`;
    this.entryCounter[key] = this.entryCounter[key] == void 0 ? 1 : this.entryCounter[key] + 1;
    return this.entryCounter[key];
  }
  resetLogEntry(anchor, level) {
    const key = `${level}:${anchor}`;
    this.entryCounter[key] = 0;
  }
  /**
   * Handle the log logic and routing
   */
  async print(level, option) {
    let anchor = lockUpInStack(9);
    anchor = anchor?.replace((0, import_process.cwd)(), "") || "";
    anchor = anchor?.match(/\((.*?)\)/)?.[1] || "unknown";
    const config2 = this.getConfig();
    const count = this.registerLogEntry(anchor, level);
    const threshold = option.threshold ?? 0;
    if (count < threshold) {
      return;
    } else {
      this.resetLogEntry(anchor, level);
    }
    const logEntry = {
      level,
      message: option.send,
      origin: anchor,
      timeStamp: (/* @__PURE__ */ new Date()).toISOString(),
      trace: option?.trace || null
    };
    const silentDev = config2.silentInDev && process.env.NODE_ENV === "development";
    const silentProd = config2.silentInProd && process.env.NODE_ENV === "production";
    if (!(silentDev || silentProd)) {
      console.log(`[CTXT/${level}][${anchor}] \u2192 ${option.send} ${option.trace ? "\n\n    Stack Trace : " + option.trace : ""}`);
    }
  }
  /**
   * Wrap a log level in a callable function
   */
  createLogguer(type) {
    const self = this;
    return (option) => self.print(type, option);
  }
  log = this.createLogguer("log");
  info = this.createLogguer("info");
  success = this.createLogguer("success");
  warn = this.createLogguer("warn");
  error = this.createLogguer("error");
  fatal = this.createLogguer("fatal");
  assert(condition, config2) {
    if (!condition) this.print(config2.level ?? "warn", config2);
  }
};

// src/index.ts
var ctxt2 = new ctxt();
ctxt.init(ctxtconfig_default);
var index_default = ctxt2;
