import { MTConf, scheduleEntrie, logConfig, LogLevel } from "../src-types/monitext.types";
import { MoniTextTransporter } from "./transporter";
import { defaultApiKeyPlaceholder, defaultMonitextConfig } from "../var";
import { MoniTextFormater } from "./formater";
import { LogFormater, loggingFormat } from "../src-types/formater.types";

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
    public static defConfig(conf: unknown) {
        let config = defaultMonitextConfig;
        if(typeof conf === "object"){
            config = { ...config, ...conf }
        } else {
            console.warn(
                "[MoniTextScheduler] expecting an object as confiuration; received: ", conf
            )
        }
        this.config = config
    }

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


    private static logFormaters = {
        dev: MoniTextFormater.devFormat,
        json: MoniTextFormater.jsonFormat,
        compact: MoniTextFormater.compactFormat
    } satisfies Record<loggingFormat, LogFormater>

    private static logToConsole(logInstance: scheduleEntrie): void {
        const isSilent = logInstance?.config?.silent;
        const globalSilenceIsActive = this.config?.silent && (this.config.silent?.includes(logInstance.level))

        if (isSilent === true)
            return;
        else if ((!isSilent || isSilent === false) && globalSilenceIsActive)
            return;

        const format: loggingFormat = this?.config?.format;
        const fallback = MoniTextFormater.devFormat;
        const formatter = this.logFormaters[format] ?? fallback;

        console.log(formatter(logInstance))
    }

    /**
     * Add a log entry to the queue for future export or manipulation.
     * @param {scheduleEntrie} entrie - The log entry to schedule.
     * @returns {Promise<void>}
     */
    public static async scheduleLog(entrie: scheduleEntrie): Promise<void> {
        this.queue.push(entrie);
        this.queueDictionnary[entrie.ref] = this.queue.length - 1;
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
    }

    /**
     * Add metadata to a scheduled log.
     * @param {symbol} ref - Symbol reference of the log.
     * @param {scheduleEntrie["meta"]} data - Metadata to attach to the log.
     * @returns {Promise<void>}
     */
    public static async addMetaDataToLog(ref: symbol, data: scheduleEntrie["meta:content"]): Promise<void> {
        const log = this.getLogInQueue(ref);
        log["meta:content"] = { ...data };
    }

    /**
     * Send and remove a scheduled log entry from the queue.
     * If API key is set and not in devMode, schedules it for transportation.
     * @param {symbol} ref - Symbol reference of the log.
     * @returns {scheduleEntrie} - The flushed log entry.
     */
    public static flush(ref: symbol): scheduleEntrie {

        const log = this.getLogInQueue(ref);

        if (this.config?.apiKey
            && this.config.apiKey != ""
            && this.config.apiKey != defaultApiKeyPlaceholder
            && (this.config?.devMode === false || this.config?.devMode === undefined)
            && (!log?.config?.send || !log?.config?.send === false)
        ) {
            MoniTextTransporter.scheduleTransportation(log);
        }

        this.logToConsole(log);

        this.deleteLogInQueue(ref);

        return log;
    }
}
