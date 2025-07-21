import { type BusConfig, type BusEvent } from "./types/event";
import { extractKeys } from "../utils/object/main";

/**
 * Represents a log server that manages subscribers, plugins, and per-level log handlers.
 */
export class MoniTextEventBus {

    private config: (typeof BusConfig);

    /**
     * List of functions that are called on every log, regardless of level.
     */
    private subscribers: Array<(log: BusEvent, config: typeof BusConfig) => void> = [];

    /**
     * Handlers organized by log level. Each level maps to an array of functions.
     */
    private levelHandlers: Record<string, Array<(log: BusEvent, config: typeof BusConfig) => void>> = {};

    // /**
    //  * List of plugins applied to this server.
    //  */
    // private plugins: BusEventHandler[] = [];

    /**
     * Creates a new MoniTextServer.
     * 
     * @param config - Configuration object passed to all handlers and plugins.
     */
    constructor(config: typeof BusConfig) { 
        this.config = extractKeys(config, "config", "format");
    }

    /**
     * Handles a log entry by executing all level-specific and global subscribers.
     * 
     * @param log - The log entry to handle.
     */
    public async handle(log: BusEvent): Promise<void> {
        const handlers = this.levelHandlers[log.toObject().level] || [];
        handlers.forEach(fn => fn(log, this.config));
        this.subscribers.forEach(fn => fn(log, this.config));
    }

    /**
     * Subscribes a function to all log events.
     * 
     * @param fn - The function to subscribe.
     */
    public subscribe(fn: (log: BusEvent, config: typeof BusConfig) => void): void {
        this.subscribers.push(fn);
    }

    /**
     * Registers a function to handle logs of a specific level (e.g., "warn", "info").
     * 
     * @param level - The log level to handle.
     * @param fn - The handler function for that level.
     */
    public on(level: string, fn: (log: BusEvent, config: unknown) => void): void {
        if (!this.levelHandlers[level]) {
            this.levelHandlers[level] = [];
        }
        this.levelHandlers[level].push(fn);
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
}
