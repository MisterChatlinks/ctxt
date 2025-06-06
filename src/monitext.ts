import { LogLevel, VerboseLogFn, CompactLogFn, CompactArgs, CompactLogger, logConfig, VerboseLogger, DefLoggerFn } from "../src-types/monitext.types"
import { lookUpInStack } from "./utils/lookUpInStack";
import { MTLogguer } from "./logguer";

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
export class MoniText {
    /**
     * Logs a message at "info" level.
     * Type depends on the logging mode ("verbose" or "shorthand").
     */
    public info: ReturnType<typeof this.mkPrinter>;

    /**
     * Logs a message at "success" level.
     * Type depends on the logging mode.
     */
    public success: ReturnType<typeof this.mkPrinter>;

    /**
     * Logs a message at "warn" level.
     * Type depends on the logging mode.
     */
    public warn: ReturnType<typeof this.mkPrinter>;

    /**
     * Logs a message at "error" level.
     * Type depends on the logging mode.
     */
    public error: ReturnType<typeof this.mkPrinter>;

    /**
     * Logs a message at "fatal" level.
     * Type depends on the logging mode.
     */
    public fatal: ReturnType<typeof this.mkPrinter>;

    /**
     * Allow to define custom log instance
    */
    public defLogguer: DefLoggerFn;

    /**
     * Available log levels supported by MoniText.
     * Can be used to validate or iterate log levels.
     */
    public static Levels: LogLevel[] = ["error", "fatal", "info", "warn", "success"];

    /**
     * Create a new MoniText instance.
     * 
     * @param mode - The desired logging mode:
     *   - `"verbose"`: logs return an enriched object with `send`, `config`, and `withMeta` chaining.
     *   - `"shorthand"`: logs return a minimal object with just `send()`, but can take metadata and config directly as arguments.
     */
    constructor(mode: "verbose" | "shorthand") {
        this.info = this.mkPrinter("info", mode);
        this.success = this.mkPrinter("success", mode);
        this.warn = this.mkPrinter("warn", mode);
        this.error = this.mkPrinter("error", mode);
        this.fatal = this.mkPrinter("fatal", mode);

        this.defLogguer = (identifyer, config = {}) => {
            if (typeof config != "object") {
                throw new Error(
                    `[MoniTexT.defLogguer] expecting an object as pre-config`
                )
            }
            const logguer = this.mkLoggerDefinition(mode);
            logguer.__meta_data__.config = config;
            logguer.__meta_data__.identifyer = identifyer;
            return logguer as unknown as (CompactLogger | VerboseLogger);
        }
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
    private print(lvl: LogLevel, stmt: unknown[], callInfo: ReturnType<typeof lookUpInStack>) {
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
    private mkPrinter(level: LogLevel, mode: string): VerboseLogFn | CompactLogFn {
        const self = this;
        if (mode === "verbose") {
            return function (...stmt: unknown[]) {
                return self.print(level, stmt, lookUpInStack(2));
            };
        } else {
            return function (log: string, param?: CompactArgs) {
                const MTLogguer = self.print(level, [log], lookUpInStack(2));
                if (param?.meta) MTLogguer.withMeta(param?.meta);
                if (param?.conf) MTLogguer.config(param?.conf);
                MTLogguer.send();
            };
        }
    }

    private mkLoggerDefinition(mode: "verbose" | "shorthand") {
        const self = this;
        const logguer = { __meta_data__: { identifyer: "", config: {} } } 

        function defVerboseMethod(m: LogLevel) {
            return function (...stmt: unknown[]) {
                const log = self.print(m, [`[${logguer.__meta_data__.identifyer as string }]`, ...stmt], lookUpInStack(2));
                      log.config(logguer.__meta_data__.config);
                return log;
            }
        }
        function defCompactMethod(m: LogLevel){
            return function (stmt: string, param?: CompactArgs) {
                const log = self.print(m, [`[${logguer.__meta_data__.identifyer}] ${stmt}`], lookUpInStack(2));
                log.config({ ...logguer.__meta_data__.config, ...(param?.conf || {}) });
                log.withMeta({ ...(param?.meta || {}) });
                log.send()
            }
        }

        if (mode == "verbose") {
            for(const key in MoniText.Levels){
                //@ts-ignore
                //!!!TODO Correct the typing to remove the ts-ignore
                logguer[MoniText.Levels[key]] = defVerboseMethod(MoniText.Levels[key]);
            }
        } else{
            for(const key in MoniText.Levels){
                //@ts-ignore 
                logguer[MoniText.Levels[key]] = defCompactMethod(MoniText.Levels[key]);
            }
        }

        return logguer
    }
}

