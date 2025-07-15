"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
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
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
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
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src-sdk/utils/object/deepCopy.ts
  function deepClone(value) {
    if (value === null || typeof value !== "object" || value instanceof Function) {
      return value;
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
      return new RegExp(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => deepClone(item));
    }
    const result = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = deepClone(value[key]);
      }
    }
    return result;
  }

  // src-sdk/utils/types/isOfType.ts
  function isAsyncFunction(fn2) {
    return typeof fn2 === "function" && fn2.toString().trimStart().match(/^async/) ? true : false;
  }
  function isNumber(num) {
    return typeof num === "number";
  }
  function isPositiveNumber(num) {
    return typeof num === "number" && !(num < 0);
  }
  function isNegativeNumber(num) {
    return typeof num === "number" && !(num < 0);
  }
  function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function isValidDate(input) {
    if (input instanceof Date) {
      return !isNaN(input.getTime());
    }
    if (typeof input === "string" || typeof input === "number") {
      const date = new Date(input);
      return !isNaN(date.getTime());
    }
    return false;
  }

  // src-sdk/utils/object/deepMerge.ts
  function deepMerge(target, source) {
    const result = __spreadValues({}, target);
    for (const key in source) {
      const srcVal = source[key];
      const tgtVal = result[key];
      if (isObject(srcVal) && isObject(tgtVal)) {
        result[key] = deepMerge(tgtVal, srcVal);
      } else {
        result[key] = srcVal;
      }
    }
    return result;
  }

  // src-sdk/utils/write/writeError.ts
  function writeMonitextError(label, ...message) {
    return `[Monitext[${label}]] ${message.join("")}`;
  }

  // src-sdk/utils/object/extractKeys.ts
  function extractKeys(target, ...keys) {
    if (!keys || keys == void 0 || keys == null || !target || !Array.isArray(keys) || typeof target !== "object") {
      throw new Error(
        writeMonitextError(
          "extractKeys",
          `Expected an object and an array of keys. Received:
Target: ${JSON.stringify(target)}
Keys: ${JSON.stringify(keys)}`
        )
      );
    }
    const result = {};
    for (const key of keys) {
      if (key == void 0 || keys == null || !(key in target)) {
        throw new Error(
          writeMonitextError(
            "extractKeys",
            `Key "${String(key)}" does not exist on target object`
          )
        );
      }
      const value = target[key];
      result[key] = typeof value === "function" ? value.bind(target) : value;
    }
    return result;
  }

  // src-sdk/core/config.ts
  var Config = class {
    constructor(config) {
      this.overrides = {};
      this.baseConfig = __spreadValues({}, config);
    }
    /**
     * Merge user-defined config values.
     * @param userDefined - Partial configuration
     * @param deep - Whether to merge nested objects deeply
     */
    merge(userDefined, deep = false) {
      this.overrides = deep ? deepMerge(this.overrides, userDefined) : __spreadValues(__spreadValues({}, this.overrides), userDefined);
      return this;
    }
    toObject() {
      return __spreadValues(__spreadValues({}, this.baseConfig), deepMerge(this.baseConfig, this.overrides));
    }
    toString() {
      return JSON.stringify(this.toObject());
    }
    get(key) {
      var _a2;
      return (_a2 = this.overrides[key]) != null ? _a2 : this.baseConfig[key];
    }
  };
  function createConfigResolver(conf, validate) {
    return function(userDefined) {
      if (validate) {
        validate(userDefined);
      }
      const copy = new Config(conf.toObject());
      return copy.merge(userDefined, true).toObject();
    };
  }

  // src-sdk/policies/default/format.ts
  var FormatingPreset = {
    /** Display the environment (e.g., node, deno, bun, browser) */
    showEnv: true,
    /** Display timestamp in log output */
    showTimestamp: true,
    /** Include the context object (if any) */
    showContext: true,
    /** Display the configuration object in the log (usually hidden) */
    showConfig: false,
    /** Show the name of the function/method that emitted the log */
    showCallerName: true,
    /** Show the file path of the log origin */
    showFileName: true,
    /** Show the line number from where the log was called */
    showLineNumber: true,
    /** Show the column number (less useful unless debugging minified code) */
    showColumnNumber: false,
    /** Include the full stack trace */
    showFullTrace: false,
    showTraceInfo: true
  };
  var createFormatingRule = createConfigResolver(new Config(FormatingPreset));
  var errorLevelsFormating = createFormatingRule({ showFullTrace: true });
  var commonLevelsFormating = createFormatingRule({ showColumnNumber: false });
  var createFormating = createConfigResolver(new Config({
    /** Desired logging style/theme */
    mode: "dev",
    info: commonLevelsFormating,
    warn: commonLevelsFormating,
    error: errorLevelsFormating,
    fatal: errorLevelsFormating,
    trace: commonLevelsFormating,
    profile: commonLevelsFormating,
    failure: commonLevelsFormating,
    success: commonLevelsFormating
  }));

  // src-sdk/policies/default/config.ts
  var createConfig = createConfigResolver(new Config({
    /** API key used to authenticate requests */
    apiKey: "",
    /** Project identifier, used for grouping logs */
    project: "",
    /** Array of log levels to silence (suppress) */
    silence: [],
    /** Interval in milliseconds between sending log batches (default: 30 seconds) */
    transportInterval: 3e4,
    /** Delay in milliseconds before retrying a failed transport attempt (default: 100 ms) */
    transportationRetryDelay: 100,
    /** Maximum number of retry attempts per transport cycle */
    transportMaxRetryPerTransport: 5,
    /** Delay in milliseconds before retrying after transport failure (default: 2 minutes) */
    transportOnFailRetryAfter: 12e4
  }));

  // src-sdk/core/policy.ts
  var MoniTextPolicy = class {
    constructor(descriptor) {
      if (!descriptor.name) {
        throw new Error(`[MoniTextPolicy] Every policy must have a name`);
      }
      this.descriptor = __spreadValues({
        phase: "core",
        priority: 0
      }, descriptor);
    }
    get name() {
      return this.descriptor.name;
    }
    get phase() {
      return this.descriptor.phase;
    }
    apply(log, config, next) {
      this.descriptor.handle(log, config, next);
    }
    matches(log) {
      const { level, filter } = this.descriptor;
      return (!level || level.includes(log.level)) && (!filter || filter(log));
    }
  };
  function applyPolicies(policies, log, config, phase = "core") {
    return new Promise((resolve) => {
      const pipeline = policies.filter((p) => p.phase === phase && p.matches(log)).sort((a, b) => a.descriptor.priority - b.descriptor.priority);
      let i = 0;
      const next = () => {
        const policy = pipeline[i++];
        if (policy) {
          policy.apply(log, config, next);
        } else {
          resolve(true);
        }
      };
      next();
    });
  }

  // src-sdk/utils/stack/shortenStackPath.ts
  function normalizaPathStart(path) {
    return path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.startsWith("/") ? path : `/${path}`;
  }
  function normalizaPathEnd(path) {
    return path.endsWith("/") ? path : `${path}/`;
  }

  // src-sdk/utils/stack/extractStackDirPath.ts
  function extractStackDirPath(line) {
    const match = line.match(/\(file:\/\/\/(.+?):\d+:\d+\)/);
    if (!match) return null;
    const fullPath = match[1];
    const segments = fullPath.split("/");
    segments.pop();
    return normalizaPathEnd(normalizaPathStart(segments.join("/")));
  }

  // src-sdk/utils/stack/lookUpInStack.ts
  var StackTraceInfo = class {
    /**
     * @param callerName {string} - Name of the calling function.
     * @param fileName {string} - The file path or name where the call occurred.
     * @param lineNumber {string | undefined} - The line number within the file.
     * @param columnNumber {string | undefined} - The column number within the line.
     * @param fullTrace {string[]} - The full captured stack trace.
     */
    constructor(callerName, fileName, lineNumber, columnNumber, fullTrace) {
      this.callerName = callerName;
      this.fileName = fileName;
      this.lineNumber = lineNumber;
      this.columnNumber = columnNumber;
      this.fullTrace = fullTrace;
    }
  };
  var isShapedLikeLookSetup = (maybeSetup) => typeof maybeSetup === "object" && maybeSetup !== null && ["node", "deno", "bun", "browser"].every((k) => typeof maybeSetup[k] === "number");
  var LookSetup = class {
    /**
     * @param config {Object} - Stack depth configuration per environment.
     * @param config.node {number} - Stack depth for Node.js.
     * @param config.deno {number} - Stack depth for Deno.
     * @param config.bun {number} - Stack depth for Bun.
     * @param config.browser {number} - Stack depth for browser environments.
     * @param config.defaults {number} - Default fallback depth if environment is unknown.
     */
    constructor({ node, deno, bun, browser, defaults }) {
      this.node = node || 2;
      this.deno = deno || 2;
      this.bun = bun || 2;
      this.browser = browser || 2;
      this.defaults = defaults || 2;
    }
  };
  function lookUpInStack(at) {
    var _a2;
    let anchor = (_a2 = Error().stack) == null ? void 0 : _a2.split("\n").map((str) => str.trim()).slice(1);
    if (typeof at !== "number") {
      const maybeSetup = at;
      if (at instanceof LookSetup) {
        at = at[DevVariables.detectEnv()] || at.defaults;
      } else if (isShapedLikeLookSetup(maybeSetup)) {
        at = new LookSetup(maybeSetup);
        at = at[DevVariables.detectEnv()] || at.defaults;
      } else {
        console.warn(`[lookUpInStack] Invalid \`at\` value. Expected number or LookSetup-compatible object, received:`, at);
        return { fullTrace: anchor };
      }
    }
    const stackLength = anchor.length - 1;
    if (at < 0 || at > stackLength || !Number.isInteger(at)) {
      console.warn(`[lookUpInStack] invalid \`at\` index, must be between 0 and ${stackLength}; received: ${at}`);
      return { fullTrace: anchor };
    }
    const targetLine = anchor[at].replace(/^at/, "").trim().split(" ");
    const targetLineLength = targetLine.length;
    if (!targetLine || targetLineLength === 0) {
      console.warn(`[lookUpInStack] No valid stack trace found at index ${at}`);
      return { fullTrace: anchor };
    }
    const IsTheCallerKnown = targetLineLength > 1;
    const callerName = IsTheCallerKnown ? targetLine[0] : "<unknown>";
    const fileName = IsTheCallerKnown ? targetLine.slice(1).join("") : targetLine[0];
    const fileNameParts = fileName.split(":");
    const fileNamePartsLength = fileNameParts.length;
    const lineNumber = fileNamePartsLength > 2 ? fileNameParts[fileNamePartsLength - 2] : fileNameParts[fileNamePartsLength - 1].replace(")", "");
    const columnNumber = fileNamePartsLength > 2 ? fileNameParts[fileNamePartsLength - 1] : "0";
    return new StackTraceInfo(
      callerName,
      fileName.replace(/\:\d*\:\d*$/, ""),
      lineNumber,
      columnNumber.replace(")", ""),
      anchor
    );
  }

  // dev.ts
  var _a, _b;
  var DevVariables = class {
    static detectEnv() {
      var _a2;
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        return "browser";
      } else if (typeof Deno !== "undefined") {
        return "deno";
      } else if (typeof Bun !== "undefined") {
        return "bun";
      } else if (typeof process !== "undefined" && (process == null ? void 0 : process.versions) && ((_a2 = process == null ? void 0 : process.versions) == null ? void 0 : _a2.node)) {
        return "node";
      }
      return void 0;
    }
  };
  DevVariables.basePath = extractStackDirPath(((_b = (_a = new Error()) == null ? void 0 : _a.stack) != null ? _b : "")[1] || "");

  // src-sdk/printUtils/browserPolify.ts
  var chalkCSSPolify = {
    // --- Modifiers ---
    reset: "color: inherit; background-color: inherit; font-weight: normal; font-style: normal; text-decoration: none; opacity: 1; filter: none;",
    bold: "font-weight: bold;",
    dim: "opacity: 0.6;",
    italic: "font-style: italic;",
    underline: "text-decoration: underline;",
    inverse: "filter: invert(100%);",
    // Note: This inverts both background and foreground colors.
    hidden: "opacity: 0;",
    // Makes the text invisible but preserves space.
    strikethrough: "text-decoration: line-through;",
    // strikethrough is an alias for strikethrough in chalk
    // visible: (Chalk doesn't have a 'visible' method, 'reset' or 'hidden' are used)
    // --- Colors (Foreground) ---
    black: "color: black;",
    red: "color: red;",
    green: "color: green;",
    yellow: "color: yellow;",
    blue: "color: blue;",
    magenta: "color: magenta;",
    cyan: "color: cyan;",
    white: "color: white;",
    gray: "color: gray;",
    // or 'grey'
    grey: "color: grey;",
    // --- Bright Colors (Foreground) ---
    blackBright: "color: #3f3f3f;",
    // Common mapping for bright black
    redBright: "color: #ff0000;",
    greenBright: "color: #00ff00;",
    yellowBright: "color: #ffff00;",
    blueBright: "color: #0000ff;",
    magentaBright: "color: #ff00ff;",
    cyanBright: "color: #00ffff;",
    whiteBright: "color: #ffffff;",
    // --- Background Colors ---
    bgBlack: "background-color: black;",
    bgRed: "background-color: red;",
    bgGreen: "background-color: green;",
    bgYellow: "background-color: yellow;",
    bgBlue: "background-color: blue;",
    bgMagenta: "background-color: magenta;",
    bgCyan: "background-color: cyan;",
    bgWhite: "background-color: white;",
    bgGray: "background-color: gray;",
    bgGrey: "background-color: grey;",
    // --- Bright Background Colors ---
    bgBlackBright: "background-color: #3f3f3f;",
    bgRedBright: "background-color: #ff0000;",
    bgGreenBright: "background-color: #00ff00;",
    bgYellowBright: "background-color: #ffff00;",
    bgBlueBright: "background-color: #0000ff;",
    bgMagentaBright: "background-color: #ff00ff;",
    bgCyanBright: "background-color: #00ffff;",
    bgWhiteBright: "background-color: #ffffff;"
  };

  // src-sdk/printUtils/interpreter.ts
  var import_chalk = __toESM(__require("chalk"));
  function createStyleTag(style, ...message) {
    return `[mtxt-style[${style}]]${message.join("")}[mtxt-style-end]`;
  }
  var TagRegex = /(\[mtxt-style\[[^\]]+\]\])|(\[mtxt-style-end\])/g;
  var startTagRegex = /\[mtxt-style\[([^\]]+)\]\]/;
  var endTag = "[mtxt-style-end]";
  function parseStyleTags(str) {
    const input = str.split(TagRegex).filter(Boolean);
    const output = [];
    const stack = [];
    const pushTo = (v) => {
      if (stack.length > 0) stack[stack.length - 1].content.push(v);
      else output.push(v);
    };
    for (const part of input) {
      if (startTagRegex.test(part)) {
        const [, styles] = part.match(startTagRegex);
        const styleObj = { style: styles.split(" "), content: [] };
        stack.push(styleObj);
      } else if (part === endTag) {
        const finished = stack.pop();
        pushTo(finished);
      } else {
        pushTo(part);
      }
    }
    return output;
  }
  function renderStyleTreeNode(tree) {
    const result = tree.map(
      (el) => {
        if (typeof el === "string") {
          return el;
        }
        const rendered = renderStyleTreeNode(el.content);
        const apply = el.style.reduce((acc, s) => {
          var _a2;
          return (_a2 = acc[s]) != null ? _a2 : acc;
        }, import_chalk.default);
        return apply(rendered);
      }
    ).join("");
    return result;
  }
  function renderStyleTreeBrowser(tree) {
    let outStr = "";
    const styleList = [];
    const walk2 = (nodes, currentStyle = "") => {
      for (const el of nodes) {
        if (typeof el === "string") {
          outStr += "%c" + el;
          styleList.push(currentStyle);
        } else {
          const newStyle = el.style.map(mapToCss).join("; ") + ";";
          walk2(el.content, newStyle);
        }
      }
    };
    walk2(tree);
    return [outStr, styleList];
  }
  function mapToCss(style) {
    return chalkCSSPolify[style] || "";
  }

  // src-sdk/printUtils/colorPack.ts
  function createColorFn(col) {
    return function(...message) {
      return createStyleTag(col, ...message);
    };
  }
  var colorHelpers = {};
  for (const keys of Object.keys(chalkCSSPolify)) {
    colorHelpers[keys] = createColorFn(keys);
  }
  var cols = colorHelpers;

  // src-sdk/printUtils/prettyPrint.ts
  var { green, bold, gray } = cols;
  function hr(title = "", opts = {}) {
    var _a2, _b2, _c;
    let terminalWidth = getTerminalWidth(80);
    const char = (_a2 = opts.char) != null ? _a2 : "\u2500";
    const color = (_b2 = opts.color) != null ? _b2 : gray;
    const pad = " ".repeat((_c = opts.padding) != null ? _c : 1);
    const cleanTitle = title ? `${pad}${title.trim()}${pad}` : "";
    const lineLength = Math.max(0, terminalWidth - cleanTitle.length);
    const leftLen = Math.floor(lineLength / 2);
    const rightLen = lineLength - leftLen;
    const line = char.repeat(leftLen) + cleanTitle + char.repeat(rightLen);
    return color(line);
  }
  function getTerminalWidth(defaultWidth = 80) {
    var _a2, _b2;
    const env = DevVariables.detectEnv();
    switch (env) {
      case "bun":
        return ((_a2 = process.stdout) == null ? void 0 : _a2.columns) || defaultWidth;
      // Bun environment
      case "node":
        return ((_b2 = process.stdout) == null ? void 0 : _b2.columns) || defaultWidth;
      // Node.js environment
      case "deno":
        return Deno.consoleSize().columns || defaultWidth;
      // Deno environment
      case "browser":
        let length;
        try {
          length = Math.floor(window.innerWidth / 8);
          return length > 0 ? length : defaultWidth;
        } catch (error) {
          return defaultWidth;
        }
      default:
        return defaultWidth;
    }
  }

  // src-sdk/printUtils/main.ts
  function writeColoredString(fn2, env = DevVariables.detectEnv()) {
    let char = "";
    const input = [];
    const push = function(c2) {
      input.push(c2);
    };
    const joinWith = function(c2) {
      char = c2;
    };
    fn2(hr, cols, push, joinWith);
    const intermediate = parseStyleTags(input.flat().join(char));
    const result = env === "browser" ? renderStyleTreeBrowser(intermediate).flat() : [renderStyleTreeNode(intermediate)];
    return result;
  }

  // src-sdk/policies/default/renderer.ts
  function createStyledRenderer(themeManager2, cols2) {
    return {
      header(level, msg) {
        const theme = themeManager2.getTheme(level);
        const color = cols2[theme.color];
        const style = cols2[theme.headerStyle || "bold"];
        return [
          `${style(color(`${theme.icon} [${level.toUpperCase()}]`))} ${cols2.whiteBright(msg.join(" "))}`
        ];
      },
      trace(level, trace) {
        const theme = themeManager2.getTheme(level);
        const lines = [];
        lines.push(`${cols2[theme.metaLabelColor || "white"]("\u{1F4CC} StackTraceInfo:\n")}`);
        if (trace.callerName) lines.push(`    \u2022 ${cols2.bold("Caller:")}   ${trace.callerName}`);
        if (trace.fileName) lines.push(`    \u2022 ${cols2.bold("File:")}     ${trace.fileName}`);
        if (trace.lineNumber) lines.push(`    \u2022 ${cols2.bold("Line:")}     ${trace.lineNumber}`);
        if (trace.columnNumber) lines.push(`    \u2022 ${cols2.bold("Column:")}   ${trace.columnNumber}`);
        return lines;
      },
      fullTrace(level, fullTrace) {
        const theme = themeManager2.getTheme(level);
        const lines = [];
        lines.push(`${cols2[theme.metaLabelColor || "white"]("\u{1F4DC} Full Trace:\n")}`);
        if (Array.isArray(fullTrace) && fullTrace.length > 0) {
          lines.push(...fullTrace.map((f) => `   - ${f}`));
        } else {
          lines.push(`   No stack trace available.`);
        }
        return lines;
      },
      context(level, context) {
        const theme = themeManager2.getTheme(level);
        const lines = [];
        lines.push(`${cols2[theme.contextColor || "white"]("\u{1F4E6} Context:")}`);
        if (!context) return ["   - No context available."];
        if (typeof context !== "object" || Object.keys(context).length !== 0) return [`   - ${context}`];
        const entries = Object.entries(context).map(([k, v]) => `   - ${k}: ${v}`).join("");
        return entries.trim() == "" ? [" - No context available."] : lines.concat(entries);
      },
      config(level, config) {
        const theme = themeManager2.getTheme(level);
        const lines = [];
        lines.push(`
${cols2[theme.configColor || "white"]("\u2699\uFE0F  Config:")}`);
        if (!config) return ["   - No config available."];
        if (typeof config !== "object") return [`   - ${config}`];
        return lines.concat(
          Object.entries(config).map(([k, v]) => `   - ${k}: ${v}`)
        );
      },
      separator(level, text = "", align = "center", override) {
        var _a2, _b2, _c, _d, _e, _f, _g;
        const theme = themeManager2.getTheme(level);
        const char = (_a2 = theme.separatorChar) != null ? _a2 : "-";
        const color = cols2[theme.color];
        const width = getTerminalWidth();
        const styleFn = cols2[(_c = (_b2 = override == null ? void 0 : override.style) != null ? _b2 : theme.separatorStyle) != null ? _c : "bold"];
        const transform = (_e = (_d = override == null ? void 0 : override.transform) != null ? _d : theme.textTransform) != null ? _e : "none";
        const showIcon = (_g = (_f = override == null ? void 0 : override.icon) != null ? _f : theme.showIconInSeparator) != null ? _g : true;
        let label = text.trim();
        if (transform === "uppercase") label = label.toUpperCase();
        if (transform === "capitalize")
          label = label[0].toUpperCase() + label.slice(1);
        if (showIcon) label = `${theme.icon} ${label}`;
        const finalLabel = `${align == "center" ? " " : ""}${label} `;
        const lineLen = Math.max(0, width - finalLabel.length);
        const left = align === "center" ? Math.floor(lineLen / 2) : 0;
        const right = Math.floor(lineLen) - left;
        const line = (char.repeat(left) + finalLabel + char.repeat(right)).split("");
        while (width - 1 < line.length) {
          line.pop();
        }
        return [color(styleFn(line.join("")))];
      }
      // separator(level: LogLevel, text: string = "", align: "center" | "left" = "center"): string[] {
      //   const theme = themeManager.getTheme(level);
      //   const char = theme.separatorChar ?? "-";
      //   const color = cols[theme.color];
      //   const termWidth = getTerminalWidth();
      //   const label = ` ${text} `;
      //   const labelLen = label.length;
      //   if (align === "left") {
      //     const rightLen = Math.max(0, termWidth - labelLen);
      //     return [color(label + char.repeat(rightLen))];
      //   }
      //   // center alignment
      //   const totalPadding = Math.max(0, termWidth - labelLen);
      //   const padLeft = Math.floor(totalPadding / 2);
      //   const padRight = totalPadding - padLeft;
      //   return [color(char.repeat(padLeft) + label + char.repeat(padRight))];
      // }
    };
  }

  // src-sdk/utils/types/main.ts
  var main_exports = {};
  __export(main_exports, {
    isAsyncFunction: () => isAsyncFunction,
    isNegativeNumber: () => isNegativeNumber,
    isNumber: () => isNumber,
    isObject: () => isObject,
    isPositiveNumber: () => isPositiveNumber,
    isValidDate: () => isValidDate,
    resolveType: () => resolveType
  });

  // src-sdk/utils/types/resolveType.ts
  function resolveType(value) {
    if (value === null) return "null";
    if (value === void 0) return "undefined";
    if (Array.isArray(value)) return "array";
    const t = typeof value;
    if (["string", "number", "boolean", "function"].includes(t)) return t;
    if (t === "object") return "object";
    return "unknown";
  }

  // src-sdk/policies/default/printer.ts
  var Formatter = {
    dev(log, theme, format) {
      const str = writeColoredString((hr2, cols2, push, joinWith) => {
        joinWith("\n");
        const { dim, bold: bold2 } = cols2;
        const param = log.toObject();
        const renderer = createStyledRenderer(theme, cols2);
        const level = param.level;
        const messages = Array.isArray(param.message) ? param.message : [param.message];
        const trace = param.meta;
        const rules = format[level];
        push("");
        push(renderer.separator(level, `[${[level]}]`, "left", { transform: "uppercase", style: "bold" }));
        push("");
        push(messages.join());
        if (rules.showTraceInfo) {
          push("");
          renderer.trace(level, trace).forEach(push);
        }
        if (rules.showFullTrace) {
          push("");
          renderer.fullTrace(level, trace.fullTrace).forEach(push);
        }
        if (rules.showContext) {
          push("");
          renderer.context(level, param.context).forEach(push);
        }
        if (rules.showConfig) {
          push("");
          renderer.config(level, param.config).forEach(push);
        }
        let end = "";
        if (rules.showEnv) {
          end += `${DevVariables.detectEnv()}, `;
          end = [end[0].toUpperCase(), end.split("").splice(1).join("").toLowerCase()].join("");
        }
        if (rules.showTimestamp) {
          end += `At ${isValidDate(param.timestamp) ? new Date(param.timestamp).toLocaleString() : (/* @__PURE__ */ new Date()).toLocaleString()}`;
        }
        push("");
        push(end);
        push(hr2("", { char: bold2("\u2500"), color: (text) => bold2(dim(text)) }));
      });
      console.log(...str);
    }
  };

  // src-sdk/printUtils/theming.ts
  var ThemeManager = class {
    constructor(defaultTheme, themes) {
      this.themes = themes;
      this.currentTheme = defaultTheme;
    }
    use(theme) {
      if (!(theme in this.themes)) throw new Error(`Theme "${theme}" not found.`);
      this.currentTheme = theme;
    }
    getTheme(level) {
      return __spreadValues(__spreadValues({}, this.themes["common"] || {}), this.themes[this.currentTheme][level]);
    }
    get current() {
      return this.currentTheme;
    }
    listThemes() {
      return Object.keys(this.themes);
    }
  };

  // src-sdk/policies/default/themes/defaults.ts
  var DefaultDevTheme = {
    // Define common properties that apply to all log levels
    common: {
      contextColor: "white",
      configColor: "white",
      metaLabelColor: "white",
      separatorChar: "\u2501",
      headerStyle: "white"
      // Moved here as it's common
    },
    info: {
      icon: "\u{1F7E6}",
      color: "blue",
      traceColor: "cyan"
    },
    warn: {
      icon: "\u26A0\uFE0F",
      color: "yellow",
      traceColor: "yellow"
    },
    error: {
      icon: "\u{1F7E5}",
      color: "red",
      traceColor: "red"
    },
    success: {
      icon: "\u2705",
      color: "green",
      traceColor: "green"
    },
    failure: {
      // Suggesting a change for failure to make it distinct
      icon: "\u274C",
      // Changed icon
      color: "yellowBright",
      // Changed color
      traceColor: "yellowBright"
    },
    fatal: {
      icon: "\u{1F480}",
      color: "redBright",
      traceColor: "redBright"
    },
    trace: {
      icon: "\u{1F50D}",
      color: "magenta",
      traceColor: "cyan"
      // 'traceColor' for 'trace' level often different than its own 'color'
    },
    profile: {
      icon: "\u23F1\uFE0F",
      // Changed icon to suggest time/performance
      color: "cyan",
      // Changed color to differentiate from trace
      traceColor: "cyan"
    }
  };

  // src-sdk/policies/default/theme.ts
  var themeManager = new ThemeManager("default", {
    default: DefaultDevTheme
    // darkMode, lightMode, prodTheme, etc.
  });

  // src-sdk/policies/default/behaviors.ts
  var logHandling = new MoniTextPolicy({
    "name": "log-on-console-policy",
    "phase": "core",
    "handle": function(log, config, next) {
      Formatter.dev(
        log,
        themeManager,
        config.format
      );
      next();
    }
  });

  // src-sdk/policies/default/index.ts
  var record = { createConfig, createFormating, policies: [logHandling] };

  // src-sdk/policies/main.ts
  var PolicyRecord = {
    default: record
  };
  function getPolicyRecord(name) {
    if (!PolicyRecord[name]) {
      throw `[Monitext[getPolicyRecord]] The requested record "${name}" could not be found;
[Availables] ${Object.keys(PolicyRecord).map(function(r) {
        return `
   - ${r}`;
      }).join("")}`;
    }
    return PolicyRecord[name];
  }

  // src-sdk/utils/time/convertTime.ts
  function convertTime(time) {
    const totalSeconds = Math.floor(time / 1e3);
    const hours = Math.floor(totalSeconds / 3600);
    let remainingTotalSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingTotalSeconds / 60);
    const seconds = remainingTotalSeconds % 60;
    const milliseconds = time % 1e3;
    return { hours, minutes, seconds, milliseconds };
  }
  function writeTimeString(data) {
    const result = [];
    const unit = (val, singular, plural) => `${val} ${val === 1 ? singular : plural}`;
    if (data.hours) result.push(unit(data.hours, "hour", "hours"));
    if (data.minutes) result.push(unit(data.minutes, "minute", "minutes"));
    if (data.seconds) result.push(unit(data.seconds, "second", "seconds"));
    if (data.milliseconds || result.length === 0)
      result.push(unit(data.milliseconds, "millisecond", "milliseconds"));
    return result.join(" ");
  }

  // src-sdk/utils/time/parseDate.ts
  function parseDate(input) {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input;
    }
    if (typeof input === "string" || typeof input === "number") {
      const parsed = new Date(input);
      return !isNaN(parsed.getTime()) ? parsed : null;
    }
    return null;
  }

  // src-sdk/core/struct.ts
  var _raw;
  var _Struct = class _Struct {
    constructor(raw = {}) {
      __privateAdd(this, _raw);
      __privateSet(this, _raw, raw);
      this._struct = Object.assign({}, raw);
      typeof (this == null ? void 0 : this.validate) === "function" && this.validate();
    }
    /**
     * Get deep copy of plain object version of this struct.
     */
    toObject() {
      return deepClone(this._struct);
    }
    /**
     * Clone the struct with overrides.
     */
    clone(overrides = {}) {
      return new this.constructor(__spreadValues(__spreadValues({}, this.toObject()), overrides));
    }
    /**
     * Patch the current instance in-place.
     */
    patch(overrides = {}) {
      Object.assign(this._struct, overrides);
      typeof (this == null ? void 0 : this.validate) === "function" && this.validate();
      return this;
    }
    describe() {
      const output = {};
      const raw_type = __privateGet(this, _raw);
      for (const key of Object.keys(__privateGet(this, _raw))) {
        const val = __privateGet(this, _raw)[key];
        const type = resolveType(val);
        if (type === "object" && val && typeof val === "object" && !Array.isArray(val)) {
          output[key] = {
            type: "object",
            required: true,
            properties: Object.fromEntries(
              Object.entries(val).map(([k, v]) => [
                k,
                {
                  type: resolveType(v),
                  default: v,
                  required: v != null && v != void 0 ? true : false
                }
              ])
            )
          };
        } else {
          output[key] = {
            type,
            default: val,
            required: true
          };
        }
      }
      return output;
    }
    pick(...keys) {
      const full = this.toObject();
      const selected = {};
      for (const key of keys) {
        selected[key] = full[key];
      }
      return selected;
    }
    omit(...keys) {
      const full = this.toObject();
      const result = __spreadValues({}, full);
      for (const key of keys) {
        delete result[key];
      }
      return result;
    }
    pickStruct(...keys) {
      var _a2;
      const self = this;
      const picked = this.pick(...keys);
      return new class extends _Struct {
        constructor() {
          super(...arguments);
          this.validate = (_a2 = self == null ? void 0 : self.validate) == null ? void 0 : _a2.bind(this);
        }
      }(picked);
    }
  };
  _raw = new WeakMap();
  var Struct = _Struct;
  function createStructFromShape(shape, validateFn) {
    class NewStruct extends Struct {
      constructor(raw) {
        super(__spreadValues(__spreadValues({}, shape), raw));
      }
      validate() {
        if (validateFn) validateFn.call(this._struct);
      }
    }
    return NewStruct;
  }

  // src-sdk/structs/policy.ts
  var Policy = {
    install: void 0
  };
  var PolicyInstance = createStructFromShape(Policy);

  // src-sdk/structs/log.ts
  var Log = {
    /** Whether this log entry has been processed and finalized */
    ready: false,
    /** Primary log level (e.g., "info", "error") */
    level: "info",
    /** Additional log levels applied to this entry (optional) */
    subLevels: [],
    /** Arbitrary context object for user metadata (e.g., request ID, tags) */
    context: {},
    /** Log Specific configuration object  */
    config: {},
    /** Log message fragments; to be joined or rendered later */
    message: [],
    /** Captured stack trace info from the log emitter's callsite */
    meta: void 0,
    /** Runtime environment in which the log was created (node, bun, browser...) */
    env: DevVariables.detectEnv(),
    /** ISO string or timestamp representing log creation time */
    timestamp: void 0,
    /** Unique symbol to identify this log instance (for deduplication or tracking) */
    identifyer: void 0
  };
  var LogInstance = createStructFromShape(Log, function() {
    var _a2, _b2;
    if (typeof this.identifyer !== "symbol") {
      throw new TypeError(
        writeMonitextError(
          "LogInstance",
          'expected a symbol as "identifyer"; received: ',
          (_a2 = this.identifyer) == null ? void 0 : _a2.toString()
        )
      );
    }
    if (typeof this.timestamp !== "string" || !isValidDate(this.timestamp)) {
      throw new TypeError(
        writeMonitextError(
          "LogInstance",
          'expected an ISO string or any valid form of date as "timestamp"; received: ',
          (_b2 = this.timestamp) == null ? void 0 : _b2.toString()
        )
      );
    }
  });

  // src-sdk/core/event.ts
  var MoniTextEventBus = class {
    // /**
    //  * List of plugins applied to this server.
    //  */
    // private plugins: BusEventHandler[] = [];
    /**
     * Creates a new MoniTextServer.
     * 
     * @param config - Configuration object passed to all handlers and plugins.
     */
    constructor(config) {
      /**
       * List of functions that are called on every log, regardless of level.
       */
      this.subscribers = [];
      /**
       * Handlers organized by log level. Each level maps to an array of functions.
       */
      this.levelHandlers = {};
      this.config = extractKeys(config, "config", "format");
    }
    /**
     * Handles a log entry by executing all level-specific and global subscribers.
     * 
     * @param log - The log entry to handle.
     */
    handle(log) {
      return __async(this, null, function* () {
        const handlers = this.levelHandlers[log.toObject().level] || [];
        handlers.forEach((fn2) => fn2(log, this.config));
        this.subscribers.forEach((fn2) => fn2(log, this.config));
      });
    }
    /**
     * Subscribes a function to all log events.
     * 
     * @param fn - The function to subscribe.
     */
    subscribe(fn2) {
      this.subscribers.push(fn2);
    }
    /**
     * Registers a function to handle logs of a specific level (e.g., "warn", "info").
     * 
     * @param level - The log level to handle.
     * @param fn - The handler function for that level.
     */
    on(level, fn2) {
      if (!this.levelHandlers[level]) {
        this.levelHandlers[level] = [];
      }
      this.levelHandlers[level].push(fn2);
    }
    // /**
    //  * Installs a plugin into the server. A plugin can be:
    //  * - an object with an `install(server)` method
    //  * - a direct subscriber function
    //  * 
    //  * @param plugin - The plugin or subscriber function to install.
    //  */
    // public use(
    //     plugin: BusEventHandler
    // ): void {
    //     if (typeof plugin === "function") {
    //         this.subscribe(plugin);
    //         this.plugins.push(plugin)
    //     } else if (plugin && typeof plugin.install === "function") {
    //         plugin.install(this, this.config);
    //         this.plugins.push(plugin);
    //     }
    //     else {
    //         console.warn("[MoniTextServer] Invalid plugin:", plugin);
    //     }
    // }
  };

  // src-sdk/utils/chaining/synchronousPromise.ts
  var c = {
    fn: function() {
    }
  };
  var fn = c.fn;
  isAsyncFunction(fn);
  var Job = class {
    constructor(name, ready = false) {
      this.name = name;
      this.ready = ready;
    }
  };
  var SynchronousPromiseReference = class {
    constructor(jobs, submit) {
      this.jobs = jobs;
      this.submit = submit;
      this.scheduled = false;
    }
  };
  var SynchronousPromiseChain = class {
    constructor(submit, chainStrength = 10) {
      this.chainStrength = chainStrength;
      this.ref = new SynchronousPromiseReference({}, submit);
    }
    /** 
     * Initialize jobs manually after subclass defines methods 
     **/
    initJobs(methods) {
      const jobMap = {};
      for (const key of methods) {
        jobMap[key] = new Job(key, true);
      }
      this.ref.jobs = jobMap;
      this.scheduleIfReady();
      return this.createProxy();
    }
    scheduleIfReady() {
      if (this.ref.scheduled === true) return;
      this.ref.scheduled = true;
      this.ref.interval = setInterval(
        () => {
          const allReady = Object.values(this.ref.jobs).every((j) => j.ready === true);
          if (!allReady) return;
          this.submit();
          clearInterval(this.ref.interval);
        },
        this.chainStrength
      );
    }
    submit() {
      return __async(this, null, function* () {
        if (typeof this.ref.submit == "function") {
          const result = yield this.ref.submit(this.ref.param);
          if (this.ref.resolveCallback) {
            this.ref.resolveCallback(result);
          }
        }
      });
    }
    then(resolve, _reject) {
      this.ref.resolveCallback = resolve;
    }
    createProxy() {
      return new Proxy(this, {
        get: (target, prop, receiver) => {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === "function" && this.ref.jobs[prop]) {
            this.ref.jobs[prop].ready = false;
            return (...args) => {
              (() => __async(this, null, function* () {
                const func = value;
                if (isAsyncFunction(value)) {
                  yield func.apply(target, args);
                } else {
                  func.apply(target, args);
                }
                this.ref.jobs[prop].ready = true;
                this.scheduleIfReady();
              }))();
              return this.createProxy();
            };
          }
          return value;
        }
      });
    }
  };

  // src-sdk/logger/chain.ts
  var ChainableLogInterface = class extends SynchronousPromiseChain {
    constructor({ log, onSubmit }) {
      super(onSubmit);
      this.ref.param = log.toObject();
      return this.initJobs(["context", "config"]);
    }
    context(data) {
      this.ref.param.context = data;
      delete this.context;
      return this.createProxy();
    }
    config(data) {
      this.ref.param.config = data;
      delete this.config;
    }
  };

  // src-sdk/core/result.ts
  var MonitextResult = class _MonitextResult {
    /**
     * Constructs a new MonitextResult instance.
     *
     * @param ok - Whether the result is a success (`true`) or failure (`false`).
     * @param value - The value returned if the result is successful.
     * @param error - The error object if the result is a failure.
     * @private
     */
    constructor(ok, value, error) {
      this.ok = ok;
      this.value = value;
      this.error = error;
    }
    /**
     * Creates a successful result.
     *
     * @param value - The value of the successful result.
     * @returns A `MonitextResult` with `ok: true` and the provided value.
     */
    static ok(value) {
      return new _MonitextResult(true, value);
    }
    /**
     * Creates a failed result.
     *
     * @param error - The error that caused the failure.
     * @returns A `MonitextResult` with `ok: false` and the provided error.
     */
    static fail(error) {
      return new _MonitextResult(false, void 0, error);
    }
  };

  // src-sdk/logger/profiler.ts
  var Profiler = class {
    constructor(fn2, target, param) {
      this.target = target;
      this.callRecord = [];
      const isAsync = isAsyncFunction(fn2);
      if (isAsync) {
        this.body = this.loadAsAsync(fn2, param);
      } else {
        this.body = this.loadAsSync(fn2, param);
      }
    }
    /**
     * Builds and returns the profiled function.
     */
    build() {
      return this.body;
    }
    /**
     * Updates the profiling statistics after a function call.
     */
    updateProfile(duration, expectedDuration, average, stack) {
      return __async(this, null, function* () {
        this.callRecord.push(duration);
        if (this.callRecord.length !== average) {
          return;
        }
        const bestCase = writeTimeString(
          convertTime(Math.min(...this.callRecord))
        );
        const worstCase = writeTimeString(
          convertTime(Math.max(...this.callRecord))
        );
        const totalTime = this.callRecord.reduce(
          (previous, current) => previous + current
        );
        const averageTime = writeTimeString(convertTime(totalTime / average));
        const averageConsecutiveTime = writeTimeString(convertTime(totalTime));
        const callPercentageInExpectedRange = this.callRecord.filter((call) => call < expectedDuration).length / average;
        const callPercentage = (callPercentageInExpectedRange * 100).toFixed(1) + "%";
        const message = `[Profiler] ${average} calls completed in ${averageConsecutiveTime}:

 \u2022 Average time per call: ${averageTime}
 \u2022 Fastest: ${bestCase}, Slowest: ${worstCase}
 \u2022 ${callPercentage} of calls completed within expected time range (expected: \u2264 ${writeTimeString(convertTime(expectedDuration))})`;
        this.emit("info", message, stack);
      });
    }
    /**
     * Reports a profiling error by emitting an error log.
     */
    repportProfilingError(error, stack) {
      return __async(this, null, function* () {
        this.emit(
          "error",
          `[Profiler][Error: (${error.name})]: ${error.message}`,
          stack
        );
      });
    }
    /**
     * Reports a timing discrepancy when the execution time exceeds the expected duration.
     */
    reportTimingDiscrepancy(duration, expectedDuration, stack) {
      return __async(this, null, function* () {
        const receivedTime = convertTime(duration);
        const expectedTime = convertTime(expectedDuration);
        this.emit(
          "warn",
          `[Profiling Warning] Execution time exceeded. Expected: ${writeTimeString(expectedTime)}, actual: ${writeTimeString(receivedTime)}`,
          stack
        );
      });
    }
    /**
     * Emits a log entry to the target event bus.
     */
    emit(level, message, meta) {
      this.target.handle(
        new LogInstance({
          level: "profile",
          subLevels: [level],
          message: Array.isArray(message) ? message : [message],
          meta,
          ready: true,
          identifyer: Symbol(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      );
    }
    /**
     * Loads the function as an asynchronous profiled function.
     */
    loadAsAsync(fn2, { expectDuration, forAverageOf }) {
      const self = this;
      return (...args) => __async(this, null, function* () {
        let result, error, start, duration;
        const stack = lookUpInStack({
          node: 2,
          deno: 2,
          bun: 3,
          browser: 2,
          defaults: 2
        });
        try {
          start = start = Date.now();
          result = yield fn2(...args);
          duration = Date.now() - start;
        } catch (e) {
          duration = Date.now() - start;
          error = e;
        }
        if (error) {
          self.repportProfilingError(error, stack);
          return MonitextResult.fail(error);
        } else {
          (() => __async(this, null, function* () {
            if (isPositiveNumber(expectDuration) && expectDuration < duration) {
              self.reportTimingDiscrepancy(
                duration,
                expectDuration,
                stack
              );
            }
            if (isPositiveNumber(forAverageOf)) {
              self.updateProfile(
                duration,
                expectDuration,
                forAverageOf,
                stack
              );
            }
          }))();
        }
        return MonitextResult.ok(result);
      });
    }
    /**
     * Loads the function as a synchronous profiled function.
     */
    loadAsSync(fn2, { expectDuration, forAverageOf }) {
      const self = this;
      return (...args) => {
        let result, error, start, duration;
        const stack = lookUpInStack({
          node: 2,
          deno: 2,
          bun: 2,
          browser: 2,
          defaults: 2
        });
        try {
          start = start = Date.now();
          result = fn2(...args);
          duration = Date.now() - start;
        } catch (e) {
          duration = Date.now() - start;
          error = e;
        }
        if (error) {
          self.repportProfilingError(error, stack);
          return MonitextResult.fail(error);
        } else {
          (() => __async(this, null, function* () {
            if (isPositiveNumber(expectDuration) && expectDuration < duration) {
              self.reportTimingDiscrepancy(
                duration,
                expectDuration,
                stack
              );
            }
            if (isPositiveNumber(forAverageOf)) {
              self.updateProfile(
                duration,
                expectDuration,
                forAverageOf,
                stack
              );
            }
          }))();
        }
        return MonitextResult.ok(result);
      };
    }
  };

  // src-sdk/logger/tracer.ts
  var import_acorn = __require("acorn");
  var import_estree_walker = __require("estree-walker");
  var astring = __toESM(__require("astring"));
  var Tracer = class {
    constructor(fn2) {
      this.fn = fn2;
      this.keywords = {
        useThrow$: "__throw$",
        useTrace$: "__trace$",
        traceDec$: "__traced$",
        fnTracer$: "__fnTracer$",
        makeResult$: "__mkResult$",
        passedArgs$: "__callArgs$"
      };
      this.traceWrapperFnBody = `function ${this.keywords.traceDec$}(fn) {
        fn.${this.keywords.useTrace$} = ${this.keywords.fnTracer$}
        fn.${this.keywords.useThrow$} = (e) => { throw new Error(e); }
        return fn;
    }`;
      this.runCode = (code, context = {}) => {
        const keys = Object.keys(context);
        const values = Object.values(context);
        return new Function(...keys, `"use strict";
${code}`)(...values);
      };
    }
    build() {
      const self = this;
      const functionBody = `(${this.removeSemiColon(this.fn.toString())})(...${this.keywords.passedArgs$})`;
      const runtimeCode = `${this.wrapFunctionDeclarationsWith(
        this.wrapFnCallsWith(functionBody)
      )}`;
      const runtimeSetup = `
        Function.prototype.${this.keywords.useTrace$} = ${this.keywords.fnTracer$}
        Function.prototype.${this.keywords.useThrow$} = (e)=> { throw new Error(e); }
        ${this.traceWrapperFnBody}
        `;
      const isAsync = isAsyncFunction(this.fn);
      const stack = [];
      const runtimeContext = {
        [this.keywords.fnTracer$]: this.makeFnTracer(stack),
        [this.keywords.makeResult$]: null
      };
      const fn2 = `(${isAsync ? "async" : ""} function (){
                try {                
                    ${runtimeSetup}
                    const result = ${isAsync ? "await" : ""} ${runtimeCode}
                    ${this.keywords.makeResult$}({ ok: true, value: result })
                } catch (e){            
                    console.log(\`[TRACE ERROR (\${e.name})] \${e.message}\`)
                    ${this.keywords.makeResult$}({ ok: false, error: e })
                }
            })()`;
      return isAsync ? function(args) {
        return __async(this, null, function* () {
          return yield new Promise((resolve) => {
            runtimeContext[self.keywords.makeResult$] = resolve;
            runtimeContext[self.keywords.passedArgs$] = [args];
            self.runCode(fn2, runtimeContext);
            console.log(JSON.stringify(stack, null, 2));
          }).then((asyncResult) => {
            return __spreadProps(__spreadValues({}, asyncResult || {}), { exec: stack });
          });
        });
      } : function(args) {
        let syncResult;
        runtimeContext[self.keywords.passedArgs$] = [args];
        runtimeContext[self.keywords.makeResult$] = (obj) => {
          syncResult = obj;
        };
        self.runCode(fn2, runtimeContext);
        console.log(JSON.stringify(stack, null, 2));
        return __spreadProps(__spreadValues({}, syncResult || {}), { exec: stack });
      };
    }
    removeSemiColon(fn2) {
      return fn2.trimEnd().replace(/\;$/, "");
    }
    uuid() {
      return Date.now();
    }
    makeFnTracer(stack) {
      const self = this;
      return function(name, fn2 = this) {
        return function(...args) {
          const meta = {};
          stack.push(meta);
          meta.start = Date.now();
          meta.label = name || (fn2 == null ? void 0 : fn2.name) || fn2.toString();
          meta.arguments = args;
          try {
            const res = fn2.apply(this, args);
            meta.result = res;
            meta.duration = `${(Date.now() - meta.start).toFixed(2)} ms`;
            return res;
          } catch (e) {
            meta.error = {
              message: `Tracing ${e == null ? void 0 : e.name} ${e == null ? void 0 : e.message}`
            };
            meta.duration = `${(Date.now() - meta.start).toFixed(2)} ms`;
            fn2[self.keywords.useThrow$](e);
          }
        };
      };
    }
    /**
     * Rewrites top-level function declarations and arrow function assignments
     * into traced(fn) calls.
     */
    wrapFunctionDeclarationsWith(code) {
      const self = this;
      const ast = (0, import_acorn.parse)(code, {
        ecmaVersion: 2022,
        sourceType: "module"
      });
      const replacements = [];
      (0, import_estree_walker.walk)(ast, {
        enter(node, parent) {
          var _a2, _b2;
          if (node.type === "VariableDeclarator" && (((_a2 = node.init) == null ? void 0 : _a2.type) === "ArrowFunctionExpression" || ((_b2 = node.init) == null ? void 0 : _b2.type) === "FunctionExpression")) {
            node.init = {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: self.keywords.traceDec$
              },
              arguments: [node.init]
            };
          }
          if (node.type === "FunctionDeclaration" && (parent == null ? void 0 : parent.type) === "Program") {
            const { id, params, body, generator, async } = node;
            const fnExpr = {
              type: "FunctionExpression",
              id,
              params,
              body,
              generator,
              async
            };
            const tracedDecl = {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [{
                type: "VariableDeclarator",
                id,
                init: {
                  type: "CallExpression",
                  callee: {
                    type: "Identifier",
                    name: self.keywords.useTrace$
                  },
                  arguments: [fnExpr]
                }
              }]
            };
            replacements.push({ node, replacement: tracedDecl });
          }
        }
      });
      for (const { node, replacement } of replacements) {
        const index = ast.body.indexOf(node);
        if (index !== -1) {
          ast.body.splice(index, 1, replacement);
        }
      }
      return astring.generate(ast);
    }
    wrapFnCallsWith(code) {
      const self = this;
      const ast = (0, import_acorn.parse)(code, {
        ecmaVersion: 2022,
        sourceType: "module"
      });
      (0, import_estree_walker.walk)(ast, {
        enter(node, _parent) {
          if (node.type === "CallExpression" && node.callee.type === "Identifier") {
            const origCallee = node.callee;
            node.callee = {
              type: "CallExpression",
              callee: {
                type: "MemberExpression",
                object: origCallee,
                property: {
                  type: "Identifier",
                  name: self.keywords.useTrace$
                },
                computed: false,
                optional: false
              },
              arguments: [
                {
                  type: "Literal",
                  value: (origCallee == null ? void 0 : origCallee.name) ? "string" : "null",
                  raw: (origCallee == null ? void 0 : origCallee.name) ? `"${origCallee == null ? void 0 : origCallee.name}"` : void 0
                }
              ],
              optional: false
            };
          }
        }
      });
      return astring.generate(ast);
    }
  };

  // src-sdk/logger/main.ts
  var MonitextLoggingInterface = class {
    constructor(bus, mode) {
      this.bus = bus;
      this.mode = mode;
      this.commonLevel = [
        "info",
        "warn",
        "error",
        "fatal",
        "success",
        "failure"
      ];
      for (const level of this.commonLevel) {
        this[level] = mode === "compact" ? this.createCompactLogEmitter(level) : this.createChainableLogEmitter(level);
      }
    }
    createCompactLogEmitter(type) {
      return (message, param) => {
        let { config, context } = param || {};
        if (context) {
          context = typeof context === "object" ? context : { $value: context };
        }
        const log = new LogInstance({
          level: type,
          message: [message],
          context,
          meta: lookUpInStack(2),
          config,
          ready: true,
          identifyer: Symbol(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        this.bus.handle(log);
        return log;
      };
    }
    createChainableLogEmitter(type) {
      const self = this;
      return (...message) => {
        const chain = new ChainableLogInterface({
          log: new LogInstance({
            message,
            level: type,
            meta: lookUpInStack({
              bun: 2,
              node: 2,
              deno: 2,
              browser: 2,
              defaults: 2
            }),
            ready: true,
            identifyer: Symbol(),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }),
          onSubmit(result) {
            const { context } = result || {};
            if (context) {
              result.context = typeof context === "object" ? context : { $value: context };
            }
            self.bus.handle(new LogInstance(result));
          }
        });
        return chain;
      };
    }
    profile(fn2, param) {
      return new Profiler(fn2, this.bus, param).build();
    }
    trace(fn2, _param) {
      return new Tracer(fn2).build();
    }
  };

  // src-sdk/index.ts
  var utils = {
    lookUpInStack,
    parseDate,
    extractKeys,
    check: main_exports,
    convertTime,
    writeTimeString
  };
  var tools = {
    createStructFromShape,
    createConfigResolver,
    writeColoredString,
    PolicyInstance,
    LogInstance,
    Config
  };
  function createRuntime(configuration) {
    var _a2, _b2;
    const policies = (_b2 = (_a2 = configuration == null ? void 0 : configuration.load) == null ? void 0 : _a2.flat().filter(
      (p) => p instanceof MoniTextPolicy
    )) != null ? _b2 : [];
    const bus = new MoniTextEventBus(
      extractKeys(configuration, "config", "format")
    );
    bus.subscribe((log, config) => __async(null, null, function* () {
      try {
        yield applyPolicies(policies, log, config, "pre");
        yield applyPolicies(policies, log, config, "core");
        yield applyPolicies(policies, log, config, "post");
      } catch (e) {
        console.warn(...writeColoredString(function(hr2, cols2, push) {
          const { bold: bold2 } = cols2;
          push(hr2("MONITEXT - SYS GUARD"));
          push(bold2(writeMonitextError("MonitextFailSafe", `A Critical Error as occured inside Monitext Logging Policy;
Cause: ${e.message}
${e == null ? void 0 : e.stack}`)));
          push(hr2("MONITEXT - SYS GUARD"));
        }));
      }
    }));
    const pack = {
      mtxt: new MonitextLoggingInterface(bus, "compact"),
      monitext: new MonitextLoggingInterface(bus, "chainable")
    };
    return pack;
  }
})();
//!!! TO DO REMOVE THIS DOWN HERE
