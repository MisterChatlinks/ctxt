import { jsonFormat } from "./utils/jsonFormat";
import { MTConf, scheduleEntrie, logConfig, LogLevel } from "../src-types/monitext.types";
import { MoniTextTransporter } from "./transporter";

/**
 * @class MoniTextScheduler
 * @description Static class responsible for scheduling, modifying, and exporting logs queued in memory.
 */
export class MoniTextScheduler {

    /** @private */
    private static config: MTConf;

    /**
     * Define the default configuration for MoniTextScheduler.
     * @param {unknown} conf - Configuration object, ideally matching MTConf shape.
     */
    public static defConfig(conf: unknown) { }

    /**
     * @private
     * @purpose Store Scheduled Logs
     * @type {scheduleEntrie[]}
     */
    private static queue: scheduleEntrie[] = [];

    /**
     * @private
     * @purpose Store reference: MTLogguer.ref -> log entry's index in the queue
     * @type {Record<symbol, number>}
     */
    private static queueDictionnary: Record<symbol, number> = {};

    /**
     * @private
     * @purpose Timeout handles for console log debouncing
     * @type {Record<symbol, NodeJS.Timeout>}
     */
    private static consoleLogQueue: Record<symbol, NodeJS.Timeout> = {}

    /**
     * @private
     * Retrieve a scheduled log from the queue using its symbol reference.
     * @param {symbol} ref - Symbol reference of the log.
     * @returns {scheduleEntrie} - The matching scheduled log entry.
     */
    private static getLogInQueue(ref: symbol): scheduleEntrie {
        const index = this.queueDictionnary[ref];
        return this.queue[index];
    }

    /**
     * @private
     * Delete a scheduled log from the queue using its symbol reference.
     * @param {symbol} ref - Symbol reference of the log to delete.
     */
    private static deleteLogInQueue(ref: symbol): void {
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
    private static logToConsole(ref: symbol, silent: boolean = false, level: LogLevel): void {
        if (silent === true) {
            clearTimeout(this.consoleLogQueue[ref])
            delete this.consoleLogQueue[ref]
            return;
        } else if (this.config?.silent && (this.config.silent?.includes(level))) {
            return;
        }

        const self = this;
        const index = this.queueDictionnary[ref];
        const log = this.queue[index];

        if (this.consoleLogQueue[ref]) {
            clearTimeout(this.consoleLogQueue[ref])
        }

        this.consoleLogQueue[ref] = setTimeout(() => {
            console.log(`[MoniText] ${jsonFormat(log)}`)
            clearTimeout(self.consoleLogQueue[ref])
            delete self.consoleLogQueue[ref]
        }, 100)
    }

    /**
     * Add a log entry to the queue for future export or manipulation.
     * @param {scheduleEntrie} entrie - The log entry to schedule.
     * @returns {Promise<void>}
     */
    public static async scheduleLog(entrie: scheduleEntrie): Promise<void> {
        this.queue.push(entrie);
        this.queueDictionnary[entrie.ref] = this.queue.length - 1;
        this.logToConsole(entrie.ref, false, entrie.level)
    }

    /**
     * Update the config for an already scheduled log.
     * @param {symbol} ref - Symbol reference of the log.
     * @param {logConfig} conf - Configuration to apply.
     * @returns {Promise<void>}
     */
    public static async configLog(ref: symbol, conf: logConfig): Promise<void> {
        if (conf && typeof conf !== "object") {
            conf = {};
            console.warn("Invalid configuration passed to logger instance; expecting an object; received: ", conf)
        }
        const log = this.getLogInQueue(ref);
        log["config"] = conf;
        this.logToConsole(ref, conf?.silent || false, log.level);
    }

    /**
     * Add metadata to a scheduled log.
     * @param {symbol} ref - Symbol reference of the log.
     * @param {scheduleEntrie["meta"]} data - Metadata to attach to the log.
     * @returns {Promise<void>}
     */
    public static async addMetaDataToLog(ref: symbol, data: scheduleEntrie["meta"]): Promise<void> {
        const log = this.getLogInQueue(ref);
        log["meta:content"] = { ...data };
        this.logToConsole(ref, log?.config?.silent || false, log.level)
    }

    /**
     * Send and remove a scheduled log entry from the queue.
     * If API key is set and not in devMode, schedules it for transportation.
     * @param {symbol} ref - Symbol reference of the log.
     * @returns {scheduleEntrie} - The flushed log entry.
     */
    public static flush(ref: symbol): scheduleEntrie {
        const log = this.getLogInQueue(ref);
        if (this.config?.apiKey && this.config?.devMode === false) {
            MoniTextTransporter.scheduleTransportation(log);
        }
        this.deleteLogInQueue(ref);
        return log;
    }
}
