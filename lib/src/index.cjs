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
  var _a, _b;
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
  const callerName = part.length > 1 ? part[0] : anchor.slice(1).length === 2 ? "<TopLevel>" : "<anonymousFn>";
  const fileName = part.length > 1 ? part.slice(1).join("") : part[0];
  const lineNumber = fileName.split(":").at(-2);
  const columnNumber = (_b = fileName.split(":").at(-1)) == null ? void 0 : _b.replace(")", "");
  return {
    callerName,
    fileName: fileName.replace(/\:\d*\:\d*$/, ""),
    lineNumber,
    columnNumber,
    fullTrace: anchor.slice(1)
  };
}

// src/transporter.ts
var MAX_RETRIES = 5;
var MoniTextTransporter = class {
  /**
   * Defines the configuration for the transporter.
   * @param {MTConf} conf - The configuration object.
   */
  static defConfig(conf) {
    this.config = conf;
    if ((conf == null ? void 0 : conf.fallback) && typeof (conf == null ? void 0 : conf.fallback) === "function") {
      this.userDefinedFallback = conf.fallback;
    }
  }
  /**
   * Checks if the current environment is Node.js.
   * @returns {boolean} True if running in Node.js, false otherwise.
   */
  static isNodeEnvironment() {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  }
  /**
   * Queues a log for batch transportation and schedules the transportation process.
   * @param {Log} log - The log to be queued.
   */
  static async scheduleTransportation(log) {
    var _a;
    this.batch.push(log);
    if (this.nextTansportationSchedule != null) {
      clearInterval(this.nextTansportationSchedule);
    }
    const debounce = ((_a = this.config) == null ? void 0 : _a.transportationDelay) || 6e4;
    this.nextTansportationSchedule = setTimeout(() => {
      if (this.batch.length === 0) {
        console.warn(`${this.name} No logs to send.`);
        return;
      }
      const logsToSend = [...this.batch];
      this.batch = [];
      this.sendLogs(logsToSend);
      this.nextTansportationSchedule = null;
    }, debounce);
  }
  /**
   * Sends logs to the API endpoint with retry logic and fallback handling.
   * @param {Log[]} logs - The logs to be sent.
   */
  static async sendLogs(logs) {
    var _a;
    try {
      await this.sendToAPI(logs);
      this.retryCount = 0;
    } catch (error) {
      this.logQueue.push(...logs);
      this.retryCount++;
      if (this.retryCount <= MAX_RETRIES) {
        setTimeout(() => this.sendLogs(this.logQueue), this.getBackoffDelay());
      } else {
        if (((_a = this.config) == null ? void 0 : _a.useDefaultFallback) === true || this.config.useDefaultFallback === void 0) {
          this.handleFallback(this.logQueue);
        }
        if (this.userDefinedFallback) {
          this.userDefinedFallback(logs);
        }
      }
    }
  }
  /**
   * Calculates the delay for exponential backoff during retries.
   * @returns {number} The delay in milliseconds.
   */
  static getBackoffDelay() {
    var _a;
    return Math.pow(2, this.retryCount) * (((_a = this.config) == null ? void 0 : _a.backOffDelay) || 1e3);
  }
  static async sendToAPI(logs) {
    var _a, _b, _c;
    const apiUrl = (_a = this.config) == null ? void 0 : _a.apiUrl;
    const apiKey = (_b = this.config) == null ? void 0 : _b.apiKey;
    if (!apiUrl || !apiKey) {
      throw new Error("API URL or API Key is not defined in the configuration.");
    }
    try {
      const payload = JSON.stringify(logs);
      const encryptedPayload = ((_c = this.config) == null ? void 0 : _c.encryptPayload) ? await this.config.encryptPayload(payload, apiKey) : payload;
      let response;
      if (typeof encryptedPayload === "object" && "payload" in encryptedPayload) {
        const { apiKey: apiKey2, payload: payload2 } = encryptedPayload;
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey2}`
          },
          body: typeof payload2 === "object" ? JSON.stringify(payload2) : payload2
        });
      } else {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: payload
        });
      }
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
      }
      console.log(`[${this.name}] Logs successfully sent to API.`);
    } catch (error) {
      console.error(`[${this.name}] Failed to send logs to API: ${error.message}`);
      throw error;
    }
  }
  /**
   * Handles fallback logic for storing logs locally or in browser storage.
   * @param {Log[]} logs - The logs to be handled in fallback.
   */
  static handleFallback(logs) {
    var _a;
    if (this.isNodeEnvironment()) {
      const filePath = ((_a = this.config) == null ? void 0 : _a.fallbackFilePath) || ".mtxt-err";
      if (typeof Deno !== "undefined") {
        this.writeToLocalFileWithDeno(logs, filePath);
      } else {
        this.writeToLocalFile(logs, filePath);
      }
    } else {
      this.writeToBrowserStorage(logs);
    }
  }
  /**
   * Writes logs to a local file in Node.js.
   * @param {Log[]} logs - The logs to be written.
   * @param {string} [filePath='.mtxt-err'] - The path to the file where logs will be written.
   */
  static async writeToLocalFile(logs, filePath = ".mtxt-err") {
    const fs = await import("fs/promises");
    try {
      await fs.appendFile(filePath, logs.join("\n") + "\n", "utf-8");
      console.log(`[${this.name}] Logs written to ${filePath}`);
    } catch (error) {
      console.error(`${this.name} Failed to write logs to file: ${error.message}`);
    }
  }
  /**
   * Writes logs to a local file in Deno.
   * @param {Log[]} logs - The logs to be written.
   * @param {string} [filePath='.mtxt-err'] - The path to the file where logs will be written.
   */
  static async writeToLocalFileWithDeno(logs, filePath = ".mtxt-err") {
    try {
      if (typeof Deno !== "undefined" && Deno.writeTextFile) {
        await Deno.writeTextFile(filePath, logs.join("\n") + "\n", { append: true });
      } else {
        throw new Error("Deno environment is not available.");
      }
      console.log(`[${this.name}] Logs written to ${filePath}`);
    } catch (error) {
      console.error(`${this.name} Failed to write logs to file: ${error.message}`);
    }
  }
  /**
   * Stores logs in browser storage (LocalStorage or IndexedDB).
   * @param {Log[]} logs - The logs to be stored.
   */
  static writeToBrowserStorage(logs) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("mtxt-logs", JSON.stringify(logs));
    } else if (typeof indexedDB !== "undefined") {
      const request = indexedDB.open("MoniTextLogs", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("logs")) {
          db.createObjectStore("logs", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");
        logs.forEach((log) => store.add(log));
      };
      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
      };
    }
  }
};
/**
 * Static variable to hold the log queue for retrying failed log sends.
 * @type {Log[]}
 */
MoniTextTransporter.logQueue = [];
/**
 * Static variable to keep track of the number of retries.
 * @type {number}
 */
MoniTextTransporter.retryCount = 0;
/**
 * Static variable to store the user-defined fallback function.
 * @type {((logs: Log[]) => void | unknown) | null}
 */
MoniTextTransporter.userDefinedFallback = null;
/**
 * Static variable to hold the current batch of logs.
 * @type {Log[]}
 */
MoniTextTransporter.batch = [];

// var.ts
var import_sha256 = __toESM(require("crypto-js/sha256"), 1);
var import_crypto_js = require("crypto-js");
var hash = (0, import_sha256.default)("myApiKey").toString();
var defaultApiKeyPlaceholder = "<YOUR_API_KEY>";
var defaultProjectNamePlaceholder = "<YOUR_PROJECT_NAME>";
var defaultApiUrl = "https://monitext.onrender.com/api/logs";
async function defaultEncryptPayload(payload, apiKey) {
  const ciphertext = import_crypto_js.AES.encrypt(payload, apiKey).toString();
  return {
    apiKey: (0, import_sha256.default)(apiKey).toString(),
    payload: JSON.stringify({
      data: ciphertext,
      magic: `MONITEXT-MAGIC ${(0, import_sha256.default)(payload).toString()}`
    })
  };
}
var defaultMonitextConfig = {
  "apiKey": defaultApiKeyPlaceholder,
  "devMode": false,
  "env": "node",
  "format": "dev",
  "project_name": defaultProjectNamePlaceholder,
  "silent": [],
  "fallback": null,
  "fallbackFilePath": "./error-logs.txt",
  "useDefaultFallback": true,
  "transportationDelay": 6e4,
  // Default to 60 seconds if not specified
  "backOffDelay": 1e3,
  // Default to 1 second if not specified,
  "encryptPayload": defaultEncryptPayload,
  "apiUrl": defaultApiUrl
};

// src/utils/jsonFormat.ts
function jsonFormat(obj, indent = 3) {
  return JSON.stringify(obj, null, indent);
}

// src/formats/jsonFormat.ts
var jsonFormatFn = (data) => {
  return jsonFormat(data);
};

// src/formats/devFormat.ts
var devFormatFn = (data) => {
  var _a;
  const { level, meta, content } = data;
  const meta_content = data["meta:content"];
  let format = `
[MoniTexT/${level.toUpperCase()}]`;
  if (Array.isArray(content)) {
    format += "\nmessage: " + content.map(
      (e) => typeof e === "string" ? e : JSON.stringify(e, null, 2)
    ).join(" ");
  } else {
    format += "\nmessage: " + (typeof content === "string" ? content : JSON.stringify(content, null, 2));
  }
  format += "\n  file: " + (meta.fileName || "unknown") + "\n  line: " + (meta.lineNumber || "?") + "\n  col: " + (meta.columnNumber || "?");
  if (["fatal", "error"].includes(level) && ((_a = meta.fullTrace) == null ? void 0 : _a.length)) {
    format += "\ntrace:\n  " + meta.fullTrace.join("\n  ");
  }
  const metaKeys = Object.keys(meta_content || {});
  if (metaKeys.length > 0) {
    format += "\nmeta:";
    for (const key of metaKeys) {
      const val = meta_content[key];
      format += `
  ${key}: ${typeof val === "object" ? JSON.stringify(val, null, 2) : val}`;
    }
  }
  if (meta.time) {
    format += `
time: ${meta.time}`;
  }
  return format;
};

// src/formats/compactFormat.ts
var compactFormatFn = (data) => {
  var _a, _b, _c, _d, _e, _f;
  const { level, meta, content } = data;
  const meta_content = data["meta:content"];
  const time = (_c = (_b = (_a = meta == null ? void 0 : meta.time) == null ? void 0 : _a.split("T")[1]) == null ? void 0 : _b.split(".")[0]) != null ? _c : "time?";
  const file = (_e = (_d = meta.fileName) == null ? void 0 : _d.split("/").pop()) != null ? _e : "file?";
  const line = (_f = meta.lineNumber) != null ? _f : "?";
  const shortMeta = (() => {
    const entries = Object.entries(meta_content != null ? meta_content : {});
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" | ");
  })();
  const output = `[${level.toUpperCase()}] ${content.join(" ")} @ ${time}` + (shortMeta ? ` | ${shortMeta}` : "") + (level === "error" || level === "warn" ? ` | file: ${file}:${line}` : "");
  return output;
};

// src/formater.ts
var _MoniTextFormater = class _MoniTextFormater {
  static createFormater(fn) {
    return function(expectData) {
      expectData["meta:content"] = expectData["meta:content"] || {};
      return fn(expectData);
    };
  }
};
_MoniTextFormater.devFormat = _MoniTextFormater.createFormater(devFormatFn);
_MoniTextFormater.jsonFormat = _MoniTextFormater.createFormater(jsonFormatFn);
_MoniTextFormater.compactFormat = _MoniTextFormater.createFormater(compactFormatFn);
var MoniTextFormater = _MoniTextFormater;

// src/scheduler.ts
var MoniTextScheduler = class {
  /**
   * Define the default configuration for MoniTextScheduler.
   * @param {unknown} conf - Configuration object, ideally matching MTConf shape.
   */
  static defConfig(conf) {
    let config = defaultMonitextConfig;
    if (typeof conf === "object") {
      config = __spreadValues(__spreadValues({}, config), conf);
    } else {
      console.warn(
        "[MoniTextScheduler] expecting an object as confiuration; received: ",
        conf
      );
    }
    this.config = config;
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
  static logToConsole(logInstance) {
    var _a, _b, _c, _d, _e;
    const isSilent = (_a = logInstance == null ? void 0 : logInstance.config) == null ? void 0 : _a.silent;
    const globalSilenceIsActive = ((_b = this.config) == null ? void 0 : _b.silent) && ((_c = this.config.silent) == null ? void 0 : _c.includes(logInstance.level));
    if (isSilent === true)
      return;
    else if ((!isSilent || isSilent === false) && globalSilenceIsActive)
      return;
    const format = (_d = this == null ? void 0 : this.config) == null ? void 0 : _d.format;
    const fallback = MoniTextFormater.devFormat;
    const formatter = (_e = this.logFormaters[format]) != null ? _e : fallback;
    console.log(formatter(logInstance));
  }
  /**
   * Add a log entry to the queue for future export or manipulation.
   * @param {scheduleEntrie} entrie - The log entry to schedule.
   * @returns {Promise<void>}
   */
  static async scheduleLog(entrie) {
    this.queue.push(entrie);
    this.queueDictionnary[entrie.ref] = this.queue.length - 1;
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
  }
  /**
   * Add metadata to a scheduled log.
   * @param {symbol} ref - Symbol reference of the log.
   * @param {scheduleEntrie["meta"]} data - Metadata to attach to the log.
   * @returns {Promise<void>}
   */
  static async addMetaDataToLog(ref, data) {
    const log = this.getLogInQueue(ref);
    log["meta:content"] = __spreadValues({}, data);
  }
  /**
   * Send and remove a scheduled log entry from the queue.
   * If API key is set and not in devMode, schedules it for transportation.
   * @param {symbol} ref - Symbol reference of the log.
   * @returns {scheduleEntrie} - The flushed log entry.
   */
  static flush(ref) {
    var _a, _b, _c, _d, _e;
    const log = this.getLogInQueue(ref);
    if (((_a = this.config) == null ? void 0 : _a.apiKey) && this.config.apiKey != "" && this.config.apiKey != defaultApiKeyPlaceholder && (((_b = this.config) == null ? void 0 : _b.devMode) === false || ((_c = this.config) == null ? void 0 : _c.devMode) === void 0) && (!((_d = log == null ? void 0 : log.config) == null ? void 0 : _d.send) || !((_e = log == null ? void 0 : log.config) == null ? void 0 : _e.send) === false)) {
      MoniTextTransporter.scheduleTransportation(log);
    }
    this.logToConsole(log);
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
MoniTextScheduler.logFormaters = {
  dev: MoniTextFormater.devFormat,
  json: MoniTextFormater.jsonFormat,
  compact: MoniTextFormater.compactFormat
};

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
  log(lvl, statemens, metaCallInfo) {
    MoniTextScheduler.scheduleLog({
      "content": statemens,
      "level": lvl,
      "ref": this.ref,
      "meta": __spreadValues({
        "time": (/* @__PURE__ */ new Date()).toISOString()
      }, metaCallInfo)
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
var _MoniText = class _MoniText {
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
    this.defLogguer = (identifyer, config = {}) => {
      if (typeof config != "object") {
        throw new Error(
          `[MoniTexT.defLogguer] expecting an object as pre-config`
        );
      }
      const logguer = this.mkLoggerDefinition(mode);
      logguer.__meta_data__.config = config;
      logguer.__meta_data__.identifyer = identifyer;
      return logguer;
    };
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
      return function(log, param) {
        const MTLogguer2 = self.print(level, [log], lookUpInStack(2));
        if (param == null ? void 0 : param.meta) MTLogguer2.withMeta(param == null ? void 0 : param.meta);
        if (param == null ? void 0 : param.conf) MTLogguer2.config(param == null ? void 0 : param.conf);
        MTLogguer2.send();
      };
    }
  }
  mkLoggerDefinition(mode) {
    const self = this;
    const logguer = { __meta_data__: { identifyer: "", config: {} } };
    function defVerboseMethod(m) {
      return function(...stmt) {
        const log = self.print(m, [`[${logguer.__meta_data__.identifyer}]`, ...stmt], lookUpInStack(2));
        log.config(logguer.__meta_data__.config);
        return log;
      };
    }
    function defCompactMethod(m) {
      return function(stmt, param) {
        const log = self.print(m, [`[${logguer.__meta_data__.identifyer}] ${stmt}`], lookUpInStack(2));
        log.config(__spreadValues(__spreadValues({}, logguer.__meta_data__.config), (param == null ? void 0 : param.conf) || {}));
        log.withMeta(__spreadValues({}, (param == null ? void 0 : param.meta) || {}));
        log.send();
      };
    }
    if (mode == "verbose") {
      for (const key in _MoniText.Levels) {
        logguer[_MoniText.Levels[key]] = defVerboseMethod(_MoniText.Levels[key]);
      }
    } else {
      for (const key in _MoniText.Levels) {
        logguer[_MoniText.Levels[key]] = defCompactMethod(_MoniText.Levels[key]);
      }
    }
    return logguer;
  }
};
/**
 * Available log levels supported by MoniText.
 * Can be used to validate or iterate log levels.
 */
_MoniText.Levels = ["error", "fatal", "info", "warn", "success"];
var MoniText = _MoniText;

// src/index.ts
function defineMonitextRuntime(config) {
  if (config && typeof config != "object") {
    throw new Error(`[defineMonitextConfig] expecting an object as config; received: ${config}`);
  }
  config = __spreadValues(__spreadValues({}, defaultMonitextConfig), config);
  if ((config == null ? void 0 : config.fallback) != null && typeof config.fallback !== "function") {
    throw new Error(`[defineMonitextConfig] fallback must be a function or null; received: ${config.fallback}`);
  }
  MoniTextScheduler.defConfig(config);
  MoniTextTransporter.defConfig(config);
  return {
    mtxt: new MoniText("shorthand"),
    monitext: new MoniText("verbose")
  };
}
//!!!TODO Correct the typing to remove the ts-ignore
