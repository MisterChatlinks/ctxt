import { MoniText } from "./monitext";
import { MoniTextScheduler } from "./scheduler";
import type { CompactLogger, MTConf, VerboseLogger } from "../src-types/monitext.types";
import { defaultMonitextConfig } from "../var";
import { MoniTextTransporter } from "./transporter";

/**
 * Defines the runtime configuration for Monitext by merging the provided configuration
 * with the default configuration. This function validates the input and ensures that
 * the configuration adheres to the expected structure.
 *
 * @param config - An optional configuration object to customize the Monitext runtime.
 *                 If provided, it must be an object. The `fallback` property, if present,
 *                 must be a function or `null`.
 * 
 * @throws {Error} If the `config` parameter is not an object.
 * @throws {Error} If the `fallback` property of the `config` is not a function or `null`.
 * 
 * @returns An object containing two logger instances:
 *          - `mtxt`: A compact logger instance for shorthand logging.
 *          - `monitext`: A verbose logger instance for detailed logging.
 */
export default function defineMonitextRuntime(config?: MTConf) {
    if (config && typeof config != "object") {
        throw new Error(`[defineMonitextConfig] expecting an object as config; received: ${config}`);
    }
    // Merge default configuration with provided config
    config = { ...defaultMonitextConfig, ...config };
    if (config?.fallback != null && typeof config.fallback !== "function") {
        throw new Error(`[defineMonitextConfig] fallback must be a function or null; received: ${config.fallback}`);
    }
    MoniTextScheduler.defConfig(config);
    MoniTextTransporter.defConfig(config);
    return {
        mtxt: new MoniText("shorthand") as CompactLogger,
        monitext: new MoniText("verbose") as VerboseLogger
    };
}

export type { CompactLogger, MTConf, VerboseLogger, MoniText }