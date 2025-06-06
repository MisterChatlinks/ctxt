import { MoniTextScheduler } from "./scheduler";
import { VerboseLogObject, LogLevel, scheduleEntrie, logConfig } from "../src-types/monitext.types";
import { extractKeys } from "./utils/extractKeys";
import { lookUpInStack } from "./utils/lookUpInStack";

/**
 * Interface for creating and chaining log events using MoniText.
 */
export class MTLogguer {

    /**
     * Unique identifier for this logger instance.
     * @type {symbol}
     */
    private ref = Symbol();

    /**
     * Schedules a log with metadata and level, and returns a chainable logger.
     * @param {LogLevel} lvl - Logging level (e.g., info, warn, error).
     * @param {unknown[]} statemens - Log message or data.
     * @param {Record<string, unknown>} metaData - Metadata to be attached to the log.
     * @returns {Pick<MTLogguer, "config" | "send" | "withMeta">}
     */
    public log(lvl: LogLevel, statemens: unknown[], metaCallInfo: ReturnType<typeof lookUpInStack>) {

        MoniTextScheduler.scheduleLog({
            "content": statemens,
            "level": lvl,
            "ref": this.ref,
            "meta": {
                "time": new Date().toISOString(),
                ...metaCallInfo
            }
        })

        return extractKeys<VerboseLogObject, MTLogguer>(this, "config", "send", "withMeta")
    }

    /**
     * Applies a configuration to the current log entry.
     * @param {logConfig} config - The configuration object (e.g., silent, threshold).
     * @returns {Pick<MTLogguer, "send" | "withMeta">}
     */
    public config(config: logConfig) {
        MoniTextScheduler.configLog(this.ref, config);
        return extractKeys<{
            send: MTLogguer["send"],
            withMeta: MTLogguer["withMeta"]
        }, MTLogguer>(this, "send", "withMeta")
    }

    /**
     * Adds additional metadata to the current log entry.
     * @param {scheduleEntrie["meta"]} metaData - Metadata key-value pairs.
     * @returns {Pick<MTLogguer, "send" | "config">}
     */
    public withMeta(metaData: scheduleEntrie["meta:content"]) {
        MoniTextScheduler.addMetaDataToLog(this.ref, metaData);
        return extractKeys<{
            send: MTLogguer["send"],
            config: MTLogguer["config"]
        }, MTLogguer>(this, "send", "config")
    }

    /**
     * Sends the log to the transporter and returns the final log entry.
     * @returns {scheduleEntrie}
     */
    public send() {
        return MoniTextScheduler.flush(this.ref);
    }
}
