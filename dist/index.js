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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => defineMonitextRuntime
});
module.exports = __toCommonJS(index_exports);

// src/utils/lookUpInStack.ts
function lookUpInStack(at) {
  let anchor = Error().stack?.split("\n").map((str) => str.trim()).slice(1);
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
  const callerName = part.length > 1 ? part[0] : "<anonymousFunction>";
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
var openpgp = __toESM(require("openpgp"));
async function encryptPayload(payload, apiKey) {
  return await openpgp.encrypt({
    message: await openpgp.createMessage({ text: payload }),
    passwords: [apiKey],
    format: "armored"
  });
}

// src/transporter.ts
var MoniTextTransporter = class {
  static config;
  static defConfig(conf) {
  }
  static accessTk;
  static batch = [];
  static nextTansportationSchedule;
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

// src/scheduler.ts
var jsonFormat = require("json-format");
var MoniTextScheduler = class {
  static config;
  static defConfig(conf) {
  }
  /**
   *@purpose - Store Scheduled Logs
  */
  static queue = [];
  /**
   *@purpose - Store reference: MTLogguer.ref -> log entry's index in the queue
  */
  static queueDictionnary = {};
  static consoleLogQueue = {};
  static getLogInQueue(ref) {
    const index = this.queueDictionnary[ref];
    return this.queue[index];
  }
  static deleteLogInQueue(ref) {
    delete this.queue[this.queueDictionnary[ref]];
    delete this.queueDictionnary[ref];
  }
  static logToConsole(ref, silent = false, level) {
    if (silent === true) {
      clearTimeout(this.consoleLogQueue[ref]);
      delete this.consoleLogQueue[ref];
      return;
    } else if (this.config?.silent && this.config.silent?.includes(level)) {
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
   *@purpose - Add a given log entry to the queue for future exportation to api
  */
  static async scheduleLog(entrie) {
    this.queue.push(entrie);
    this.queueDictionnary[entrie.ref] = this.queue.length - 1;
    this.logToConsole(entrie.ref, false, entrie.level);
  }
  /**
   *@purpose - Configure a preciously stored log entrie in the queue
  */
  static async configLog(ref, conf) {
    if (conf && typeof conf != "object") {
      conf = {};
      console.warn("Invalid configuration passed to logger instance; expecting an object; received: ", conf);
    }
    const log = this.getLogInQueue(ref);
    log["config"] = conf;
    this.logToConsole(ref, conf?.silent || false, log.level);
  }
  /**
   *@purpose - Configure a preciously stored log entrie in the queue
  */
  static async addMetaDataToLog(ref, data) {
    const log = this.getLogInQueue(ref);
    log["meta:content"] = { ...data };
    this.logToConsole(ref, log?.config?.silent || false, log.level);
  }
  /**
   * @purpose - Init deportation of a previously stored log in the queue
  */
  static flush(ref) {
    const log = this.getLogInQueue(ref);
    if (this.config?.apiKey && this.config?.devMode === false) {
      MoniTextTransporter.scheduleTransportation(log);
    }
    this.deleteLogInQueue(ref);
    return log;
  }
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
      throw new Error(`[MT/extractKeys] key: ${current} does not exit on ${target}`);
    }
    result[current] = typeof target[current] === "function" ? target[current].bind(target) : target[current];
  }
  return result;
}

// src/logguer.ts
var MTLogguer = class {
  ref = Symbol();
  log(lvl, statemens, metaData) {
    MoniTextScheduler.scheduleLog({
      "content": statemens,
      "level": lvl,
      "ref": this.ref,
      "meta": {
        "time": (/* @__PURE__ */ new Date()).toISOString(),
        ...metaData
      }
    });
    return extractKeys(this, "config", "send", "withMeta");
  }
  config(config) {
    MoniTextScheduler.configLog(this.ref, config);
    return extractKeys(this, "send", "withMeta");
  }
  withMeta(metaData) {
    MoniTextScheduler.addMetaDataToLog(this.ref, metaData);
    return extractKeys(this, "send", "config");
  }
  send() {
    return MoniTextScheduler.flush(this.ref);
  }
};

// src/monitext.ts
var MoniText = class {
  info;
  success;
  warn;
  error;
  fatal;
  constructor(mode) {
    this.info = this.mkPrinter("info", mode);
    this.success = this.mkPrinter("success", mode);
    this.warn = this.mkPrinter("warn", mode);
    this.error = this.mkPrinter("error", mode);
    this.fatal = this.mkPrinter("fatal", mode);
  }
  static Levels = ["error", "fatal", "info", "warn", "success"];
  print(lvl, stmt, callInfo) {
    return new MTLogguer().log(lvl, stmt, callInfo);
  }
  /**
   * @purose logging Interface, wrap the simple print method in a given level
   */
  mkPrinter(level, mode) {
    const self = this;
    if (mode == "verbose") {
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

// src/index.ts
function defineMonitextRuntime(config) {
  if (config && typeof config != "object") {
    throw new Error(
      `[defineMonitextConfig] expecting an oject as config; received: ${config}`
    );
  }
  if (config) MoniTextScheduler.defConfig(config);
  return {
    mtxt: new MoniText("shorthand"),
    monitext: new MoniText("verbose")
  };
}
