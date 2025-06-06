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

// src/utils/encrypt.ts
import { encrypt, createMessage } from "openpgp";
async function encryptPayload(payload, apiKey) {
  return await encrypt({
    message: await createMessage({ text: payload }),
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

// var.ts
var defaultApiKeyPlaceholder = "<YOUR_API_KEY>";
var defaultProjectNamePlaceholder = "<YOUR_PROJECT_NAME>";
var defaultMonitextConfig = {
  "apiKey": defaultApiKeyPlaceholder,
  "devMode": false,
  "env": "node",
  "format": "dev",
  "project_name": defaultProjectNamePlaceholder,
  "silent": []
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
    var _a, _b, _c, _d;
    const log = this.getLogInQueue(ref);
    if (((_a = this.config) == null ? void 0 : _a.apiKey) && this.config.apiKey != "" && this.config.apiKey != defaultApiKeyPlaceholder && ((_b = this.config) == null ? void 0 : _b.devMode) === false && (!((_c = log == null ? void 0 : log.config) == null ? void 0 : _c.send) || !((_d = log == null ? void 0 : log.config) == null ? void 0 : _d.send) === false)) {
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
        const log = self.print("warn", [`[${logguer.__meta_data__.identifyer}] ${stmt}`], lookUpInStack(2));
        log.config(__spreadValues(__spreadValues({}, logguer.__meta_data__.config), (param == null ? void 0 : param.conf) || {}));
        if (param == null ? void 0 : param.meta) log.withMeta(__spreadValues({}, param.meta));
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
  if (config) MoniTextScheduler.defConfig(config);
  return {
    mtxt: new MoniText("shorthand"),
    monitext: new MoniText("verbose")
  };
}
export {
  defineMonitextRuntime as default
};
