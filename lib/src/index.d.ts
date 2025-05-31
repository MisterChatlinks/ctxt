/**
 * Interface for creating and chaining log events using MoniText.
 */
declare class MTLogguer {
    /**
     * Unique identifier for this logger instance.
     * @type {symbol}
     */
    private ref;
    /**
     * Schedules a log with metadata and level, and returns a chainable logger.
     * @param {LogLevel} lvl - Logging level (e.g., info, warn, error).
     * @param {unknown[]} statemens - Log message or data.
     * @param {Record<string, unknown>} metaData - Metadata to be attached to the log.
     * @returns {Pick<MTLogguer, "config" | "send" | "withMeta">}
     */
    log(lvl: LogLevel, statemens: unknown[], metaData: Record<string, unknown>): VerboseLogObject;
    /**
     * Applies a configuration to the current log entry.
     * @param {logConfig} config - The configuration object (e.g., silent, threshold).
     * @returns {Pick<MTLogguer, "send" | "withMeta">}
     */
    config(config: logConfig): {
        send: MTLogguer["send"];
        withMeta: MTLogguer["withMeta"];
    };
    /**
     * Adds additional metadata to the current log entry.
     * @param {scheduleEntrie["meta"]} metaData - Metadata key-value pairs.
     * @returns {Pick<MTLogguer, "send" | "config">}
     */
    withMeta(metaData: scheduleEntrie["meta"]): {
        send: MTLogguer["send"];
        config: MTLogguer["config"];
    };
    /**
     * Sends the log to the transporter and returns the final log entry.
     * @returns {scheduleEntrie}
     */
    send(): scheduleEntrie;
}

type LogLevel = "info" | "success" | "warn" | "error" | "fatal";
type scheduleEntrie = {
    content: unknown[];
    config?: logConfig;
    level: LogLevel;
    meta: Record<string, number | string | boolean | null | undefined>;
    ref: symbol;
    "meta:content"?: Record<string, number | string | boolean | null | undefined>;
};
type alertOption = "sms" | "call" | "mail";
type logConfig = {
    threshold?: number;
    silent?: boolean;
    class?: string;
    use?: alertOption[];
};
interface MTConf {
    env: "node" | "web";
    apiKey: string;
    devMode: boolean;
    silent: LogLevel[];
    project_name: string;
}
type VerboseLogObject = {
    config: MTLogguer["config"];
    send: MTLogguer["send"];
    withMeta: MTLogguer["withMeta"];
};
type MetaType = scheduleEntrie["meta:content"];
type VerboseLogFn = (...stmt: unknown[]) => VerboseLogObject;
type CompactLogFn = (log: string, meta?: MetaType, conf?: logConfig) => {
    send: () => void;
};
interface VerboseLogger {
    info: VerboseLogFn;
    error: VerboseLogFn;
    warn: VerboseLogFn;
    success: VerboseLogFn;
}
interface CompactLogger {
    info: CompactLogFn;
    error: CompactLogFn;
    warn: CompactLogFn;
    success: CompactLogFn;
}

/**
 * MoniText provides a logging interface that supports both verbose and compact (shorthand) logging modes.
 * It wraps around the MTLogguer system and allows creating structured logs enriched with metadata and alert configuration.
 *
 * @example
 * const logger = new MoniText("verbose");
 * logger.info("Something happened").send();
 *
 * const compact = new MoniText("shorthand");
 * compact.info("Just a quick log").send();
 */
declare class MoniText {
    /**
     * Logs a message at "info" level.
     * Type depends on the logging mode ("verbose" or "shorthand").
     */
    info: ReturnType<typeof this.mkPrinter>;
    /**
     * Logs a message at "success" level.
     * Type depends on the logging mode.
     */
    success: ReturnType<typeof this.mkPrinter>;
    /**
     * Logs a message at "warn" level.
     * Type depends on the logging mode.
     */
    warn: ReturnType<typeof this.mkPrinter>;
    /**
     * Logs a message at "error" level.
     * Type depends on the logging mode.
     */
    error: ReturnType<typeof this.mkPrinter>;
    /**
     * Logs a message at "fatal" level.
     * Type depends on the logging mode.
     */
    fatal: ReturnType<typeof this.mkPrinter>;
    /**
     * Available log levels supported by MoniText.
     * Can be used to validate or iterate log levels.
     */
    static Levels: LogLevel[];
    /**
     * Create a new MoniText instance.
     *
     * @param mode - The desired logging mode:
     *   - `"verbose"`: logs return an enriched object with `send`, `config`, and `withMeta` chaining.
     *   - `"shorthand"`: logs return a minimal object with just `send()`, but can take metadata and config directly as arguments.
     */
    constructor(mode: "verbose" | "shorthand");
    /**
     * Internal method to create and send a log with full control over level, message content, and call context.
     *
     * @param lvl - The log level
     * @param stmt - The statements or messages to log
     * @param callInfo - Additional metadata extracted from the call stack (e.g., file, line)
     * @returns A structured VerboseLogObject
     * @private
     */
    private print;
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
    private mkPrinter;
}

declare function defineMonitextRuntime(config?: MTConf): {
    mtxt: CompactLogger;
    monitext: VerboseLogger;
};

export { type CompactLogger, type MTConf, MoniText, type VerboseLogger, defineMonitextRuntime as default };
