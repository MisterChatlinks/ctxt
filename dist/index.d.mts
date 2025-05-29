declare class MTLogguer {
    private ref;
    log(lvl: LogLevel, statemens: unknown[], metaData: Record<string, unknown>): VerboseLogObject;
    config(config: logConfig): {
        send: MTLogguer["send"];
        withMeta: MTLogguer["withMeta"];
    };
    withMeta(metaData: scheduleEntrie["meta"]): {
        send: MTLogguer["send"];
        config: MTLogguer["config"];
    };
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
    handleRejection: boolean;
    handleException: boolean;
    silent: LogLevel[];
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

declare class MoniText {
    info: ReturnType<typeof this.mkPrinter>;
    success: ReturnType<typeof this.mkPrinter>;
    warn: ReturnType<typeof this.mkPrinter>;
    error: ReturnType<typeof this.mkPrinter>;
    fatal: ReturnType<typeof this.mkPrinter>;
    constructor(mode: "verbose" | "shorthand");
    static Levels: LogLevel[];
    private print;
    /**
     * @purose logging Interface, wrap the simple print method in a given level
     */
    private mkPrinter;
}

/**
 * Initializes and defines the global MoniText configuration.
 *
 * This function registers the user's configuration into the MoniText scheduler and returns
 * two logger interfaces:
 *
 * - `mtxt`: A lightweight shorthand logger for fast integration.
 * - `monitext`: A verbose logger that promotes logging hygiene and traceability.
 *
 * @param {object} config - The MoniText global configuration object.
 * @param {string} config.project_name - Name of the project using MoniText.
 * @param {string} config.apiKey - API key for authenticating with the MoniText backend.
 * @param {boolean} [config.devMode=false] - If true, logs are only printed locally and not sent to API.
 * @param {boolean} [config.verbose=true] - If true, includes metadata visibility in local console logs.
 * @param {object} [config.env] - Runtime environment configuration.
 * @param {'node'|'browser'} [config.env.type='node'] - Runtime type for exception handling.
 * @param {boolean} [config.env.handleRejection=true] - Whether to auto-handle unhandled Promise rejections.
 * @param {boolean} [config.env.handleException=true] - Whether to auto-handle uncaught exceptions.
 *
 * @returns {{
 *   mtxt: MoniText,
 *   monitext: MoniText
 * }} An object containing the two logger interfaces.
 *
 * @example
 * import { defineMonitextConfig } from "monitext/setup";
 * const { mtxt, monitext } = defineMonitextConfig({
 *   project_name: "test",
 *   apiKey: "abc123",
 *   devMode: false,
 *   verbose: true,
 *   env: { type: "node", handleRejection: true, handleException: true }
 * });
 *
 * mtxt.error("Simple error", { userId: "123" }).send();
 *
 * monitext.error("Verbose error")
 *   .withMeta({ userId: "123", requestId: "req-456" })
 *   .config({ class: "AUTH", use: ["mail", "sms"] })
 *   .send();
 */
declare function defineMonitextRuntime(config?: MTConf): {
    mtxt: MoniText & CompactLogger;
    monitext: MoniText & VerboseLogger;
};

export { defineMonitextRuntime as default };
