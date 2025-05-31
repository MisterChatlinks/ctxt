"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => defineMonitextRuntime
});
module.exports = __toCommonJS(index_exports);

// src/utils/lookUpInStack.ts
function lookUpInStack(at) {
  var _a;
  let anchor = (_a = Error().stack) == null ? void 0 : _a.split("\n").map((str) => str.trim()).slice(1);
  if (!at) {
    return { fullTrace: anchor };
  }
  if (at && typeof at != "number") {
    console.warn(
      "invalid argument passed to lockUpInStack, expecting a number"
    );
    return { fullTrace: anchor };
  }
  if (!anchor[at]) {
    console.warn("invalid `at` index passed to lockUpInStack");
    return { fullTrace: anchor };
  }
  const part = anchor[at].replace(/^at/, "").trim().split(" ");
  const callerName = part.length > 1 ? part[0] : "<TopLevel>";
  const fileName = part.length > 1 ? part.slice(1).join("") : part[0];
  const lineNumber = fileName.split(":").at(-2);
  const columnNumber = fileName.split(":").at(-1);
  return {
    callerName,
    fileName: fileName.replace(/\:\d*\:\d*$/, ""),
    lineNumber,
    columnNumber,
    fullTrace: anchor.slice(1)
  };
}

// src/utils/jsonFormat.ts
function jsonFormat(obj, indent = 3) {
  return JSON.stringify(obj, null, indent);
}

// src/utils/encrypt.ts
var openpgp = __toESM(require("openpgp"), 1);
async function encryptPayload(payload, apiKey) {
  return await openpgp.encrypt({
    message: await openpgp.createMessage({ text: payload }),
    passwords: [apiKey],
    format: "armored"
  });
}

// src/transporter.ts
var MoniTextTransporter = class {
  static defConfig(conf) {
  }
  static async scheduleTransportation(log) {
    this.batch.push(log);
    if (this.nextTansportationSchedule === null) return;
    const self = this;
    let retry = 0;
    this.nextTansportationSchedule = setInterval(async () => {
      retry++;
      const transportationResult = await this.transportToServer(this.batch);
      if (transportationResult.status === 200 || retry === 10) {
        self.batch = [];
        clearInterval(self.nextTansportationSchedule);
        self.nextTansportationSchedule = null;
      }
      if (retry === 10) {
        console.warn("Failed to transport logs to server endpoint; reason: ", transportationResult);
      }
    }, 6e4);
  }
  static async transportToServer(log) {
    return await (await fetch("https://monitext.onrender.com/v1/api/sdk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.accessTk}`
      },
      body: await encryptPayload(JSON.stringify(log), this.config.apiKey)
    })).json();
  }
  static async requestServerToken(log) {
    try {
      const Token = await (await fetch("https://monitext.onrender.com/v1/api/sdk", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        }
      })).json();
      if (!Token.tk) {
        return false;
      }
      this.accessTk = Token.tk;
    } catch (error) {
    }
    return true;
  }
};
MoniTextTransporter.batch = [];

// src/scheduler.ts
var MoniTextScheduler = class {
  /**
   * Define the default configuration for MoniTextScheduler.
   * @param {unknown} conf - Configuration object, ideally matching MTConf shape.
   */
  static defConfig(conf) {
  }
  /**
   * @private
   * Retrieve a scheduled log from the queue using its symbol reference.
   * @param {symbol} ref - Symbol reference of the log.
   * @returns {scheduleEntrie} - The matching scheduled log entry.
   */
  static getLogInQueue(ref) {
    const index = this.queueDictionnary[ref];
    return this.queue[index];
  }
  /**
   * @private
   * Delete a scheduled log from the queue using its symbol reference.
   * @param {symbol} ref - Symbol reference of the log to delete.
   */
  static deleteLogInQueue(ref) {
    delete this.queue[this.queueDictionnary[ref]];
    delete this.queueDictionnary[ref];
  }
  /**
   * @private
   * Print the log to the console unless silenced.
   * @param {symbol} ref - Symbol reference of the log.
   * @param {boolean} [silent=false] - Whether to suppress console output.
   * @param {LogLevel} level - The severity level of the log.
   */
  static logToConsole(ref, silent = false, level) {
    var _a, _b;
    if (silent === true) {
      clearTimeout(this.consoleLogQueue[ref]);
      delete this.consoleLogQueue[ref];
      return;
    } else if (((_a = this.config) == null ? void 0 : _a.silent) && ((_b = this.config.silent) == null ? void 0 : _b.includes(level))) {
      return;
    }
    const self = this;
    const index = this.queueDictionnary[ref];
    const log = this.queue[index];
    if (this.consoleLogQueue[ref]) {
      clearTimeout(this.consoleLogQueue[ref]);
    }
    this.consoleLogQueue[ref] = setTimeout(() => {
      console.log(`[MoniText] ${jsonFormat(log)}`);
      clearTimeout(self.consoleLogQueue[ref]);
      delete self.consoleLogQueue[ref];
    }, 100);
  }
  /**
   * Add a log entry to the queue for future export or manipulation.
   * @param {scheduleEntrie} entrie - The log entry to schedule.
   * @returns {Promise<void>}
   */
  static async scheduleLog(entrie) {
    this.queue.push(entrie);
    this.queueDictionnary[entrie.ref] = this.queue.length - 1;
    this.logToConsole(entrie.ref, false, entrie.level);
  }
  /**
   * Update the config for an already scheduled log.
   * @param {symbol} ref - Symbol reference of the log.
   * @param {logConfig} conf - Configuration to apply.
   * @returns {Promise<void>}
   */
  static async configLog(ref, conf) {
    if (conf && typeof conf !== "object") {
      conf = {};
      console.warn("Invalid configuration passed to logger instance; expecting an object; received: ", conf);
    }
    const log = this.getLogInQueue(ref);
    log["config"] = conf;
    this.logToConsole(ref, (conf == null ? void 0 : conf.silent) || false, log.level);
  }
  /**
   * Add metadata to a scheduled log.
   * @param {symbol} ref - Symbol reference of the log.
   * @param {scheduleEntrie["meta"]} data - Metadata to attach to the log.
   * @returns {Promise<void>}
   */
  static async addMetaDataToLog(ref, data) {
    var _a;
    const log = this.getLogInQueue(ref);
    log["meta:content"] = __spreadValues({}, data);
    this.logToConsole(ref, ((_a = log == null ? void 0 : log.config) == null ? void 0 : _a.silent) || false, log.level);
  }
  /**
   * Send and remove a scheduled log entry from the queue.
   * If API key is set and not in devMode, schedules it for transportation.
   * @param {symbol} ref - Symbol reference of the log.
   * @returns {scheduleEntrie} - The flushed log entry.
   */
  static flush(ref) {
    var _a, _b;
    const log = this.getLogInQueue(ref);
    if (((_a = this.config) == null ? void 0 : _a.apiKey) && ((_b = this.config) == null ? void 0 : _b.devMode) === false) {
      MoniTextTransporter.scheduleTransportation(log);
    }
    this.deleteLogInQueue(ref);
    return log;
  }
};
/**
 * @private
 * @purpose Store Scheduled Logs
 * @type {scheduleEntrie[]}
 */
MoniTextScheduler.queue = [];
/**
 * @private
 * @purpose Store reference: MTLogguer.ref -> log entry's index in the queue
 * @type {Record<symbol, number>}
 */
MoniTextScheduler.queueDictionnary = {};
/**
 * @private
 * @purpose Timeout handles for console log debouncing
 * @type {Record<symbol, NodeJS.Timeout>}
 */
MoniTextScheduler.consoleLogQueue = {};

// src/utils/extractKeys.ts
function extractKeys(target, ...keys) {
  if (!keys || !target || !Array.isArray(keys) || typeof target !== "object") {
    throw new Error(`[MT/extractKeys] expecting an object and they key that need to be returned; received: ${{ keys, target }}`);
  }
  const result = {};
  for (const key in keys) {
    const current = keys[key];
    if (!target[current]) {
      throw new Error(`[MoniText/extractKeys] key: ${current} does not exit on ${target}`);
    }
    result[current] = typeof target[current] === "function" ? target[current].bind(target) : target[current];
  }
  return result;
}

// src/logguer.ts
var MTLogguer = class {
  constructor() {
    /**
     * Unique identifier for this logger instance.
     * @type {symbol}
     */
    this.ref = Symbol();
  }
  /**
   * Schedules a log with metadata and level, and returns a chainable logger.
   * @param {LogLevel} lvl - Logging level (e.g., info, warn, error).
   * @param {unknown[]} statemens - Log message or data.
   * @param {Record<string, unknown>} metaData - Metadata to be attached to the log.
   * @returns {Pick<MTLogguer, "config" | "send" | "withMeta">}
   */
  log(lvl, statemens, metaData) {
    MoniTextScheduler.scheduleLog({
      "content": statemens,
      "level": lvl,
      "ref": this.ref,
      "meta": __spreadValues({
        "time": (/* @__PURE__ */ new Date()).toISOString()
      }, metaData)
    });
    return extractKeys(this, "config", "send", "withMeta");
  }
  /**
   * Applies a configuration to the current log entry.
   * @param {logConfig} config - The configuration object (e.g., silent, threshold).
   * @returns {Pick<MTLogguer, "send" | "withMeta">}
   */
  config(config) {
    MoniTextScheduler.configLog(this.ref, config);
    return extractKeys(this, "send", "withMeta");
  }
  /**
   * Adds additional metadata to the current log entry.
   * @param {scheduleEntrie["meta"]} metaData - Metadata key-value pairs.
   * @returns {Pick<MTLogguer, "send" | "config">}
   */
  withMeta(metaData) {
    MoniTextScheduler.addMetaDataToLog(this.ref, metaData);
    return extractKeys(this, "send", "config");
  }
  /**
   * Sends the log to the transporter and returns the final log entry.
   * @returns {scheduleEntrie}
   */
  send() {
    return MoniTextScheduler.flush(this.ref);
  }
};

// src/monitext.ts
var MoniText = class {
  /**
   * Create a new MoniText instance.
   * 
   * @param mode - The desired logging mode:
   *   - `"verbose"`: logs return an enriched object with `send`, `config`, and `withMeta` chaining.
   *   - `"shorthand"`: logs return a minimal object with just `send()`, but can take metadata and config directly as arguments.
   */
  constructor(mode) {
    this.info = this.mkPrinter("info", mode);
    this.success = this.mkPrinter("success", mode);
    this.warn = this.mkPrinter("warn", mode);
    this.error = this.mkPrinter("error", mode);
    this.fatal = this.mkPrinter("fatal", mode);
  }
  /**
   * Internal method to create and send a log with full control over level, message content, and call context.
   *
   * @param lvl - The log level
   * @param stmt - The statements or messages to log
   * @param callInfo - Additional metadata extracted from the call stack (e.g., file, line)
   * @returns A structured VerboseLogObject
   * @private
   */
  print(lvl, stmt, callInfo) {
    return new MTLogguer().log(lvl, stmt, callInfo);
  }
  /**
   * Logging interface factory.
   * Wraps the `print` method based on the selected mode.
   *
   * @param level - The log level to wrap
   * @param mode - Either `"verbose"` or `"shorthand"`
   * @returns A logging function tailored to the mode
   * 
   * @example
   * const log = mkPrinter("info", "verbose");
   * log("This is verbose").withMeta({foo: "bar"}).send();
   * 
   * @example
   * const log = mkPrinter("info", "shorthand");
   * log("Quick message", {foo: "bar"}, {silent: true}).send();
   * 
   * @private
   */
  mkPrinter(level, mode) {
    const self = this;
    if (mode === "verbose") {
      return function(...stmt) {
        return self.print(level, stmt, lookUpInStack(2));
      };
    } else {
      return function(log, meta, conf) {
        const MTLogguer2 = self.print(level, [log], lookUpInStack(2));
        if (meta) MTLogguer2.withMeta(meta);
        if (conf) MTLogguer2.config(conf);
        return { send: MTLogguer2.send.bind(MTLogguer2) };
      };
    }
  }
};
/**
 * Available log levels supported by MoniText.
 * Can be used to validate or iterate log levels.
 */
MoniText.Levels = ["error", "fatal", "info", "warn", "success"];

// src/index.ts
function defineMonitextRuntime(config) {
  if (config && typeof config != "object") {
    throw new Error(`[defineMonitextConfig] expecting an object as config; received: ${config}`);
  }
  if (config) MoniTextScheduler.defConfig(config);
  return {
    mtxt: new MoniText("shorthand"),
    monitext: new MoniText("verbose")
  };
}
