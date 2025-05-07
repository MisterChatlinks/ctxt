type ctxtLogLevel = "fatal" | "error" | "warn" | "info" | "success" | "log";
type ctxtCallConfig = {
    send: unknown;
    throw?: boolean;
    silentInProd?: true;
    silentInDev?: true;
    threshold?: number;
    flag?: string;
    trace?: unknown;
};
type ctxtLogguer = (opt: ctxtCallConfig) => void;

declare class ctxt$1 {
    private static ConfigCache;
    private entryCounter;
    static init(config: any): void;
    /**
     * Get and cache ctxt config
     */
    private getConfig;
    /**
     * Track how many times a log has been triggered at a specific location
     */
    private registerLogEntry;
    private resetLogEntry;
    /**
     * Handle the log logic and routing
     */
    private print;
    /**
     * Wrap a log level in a callable function
     */
    private createLogguer;
    log: ctxtLogguer;
    info: ctxtLogguer;
    success: ctxtLogguer;
    warn: ctxtLogguer;
    error: ctxtLogguer;
    fatal: ctxtLogguer;
    assert(condition: boolean, config: ctxtCallConfig & {
        level?: ctxtLogLevel;
    }): void;
}

declare const ctxt: ctxt$1;

export { ctxt as default };
