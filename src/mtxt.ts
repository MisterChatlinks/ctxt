import { cwd } from "process";
import { getCallerInfo, lockUpInStack } from "./utils";
import { CTXTConfig } from "./config";


import {
    ctxtCallConfig,
    ctxtLogLevel,
    ctxtLogguer,
    ctxtRootConfig
} from "../types/ctxt.type";

export default class ctxt {
    private static ConfigCache: ctxtRootConfig;
    private  entryCounter: Record<string, number> = {};

    public static init(config: any){
        this.ConfigCache = config
    }

    /**
     * Get and cache ctxt config
     */
    private  getConfig(): ctxtRootConfig {
        if (ctxt.ConfigCache !== undefined) return ctxt.ConfigCache;
        return CTXTConfig({});
    }

    /**
     * Track how many times a log has been triggered at a specific location
     */
    private registerLogEntry(anchor: string, level: ctxtLogLevel): number {
        const key = `${level}:${anchor}`;
        this.entryCounter[key] =  
            (this.entryCounter[key] == undefined) 
            ? 1 // init at one cause if this is hit, it's cause ctxt.<level>(...) as been called
            : this.entryCounter[key] + 1;
        return this.entryCounter[key];
    }

    private resetLogEntry(anchor: string, level: ctxtLogLevel): void {
        const key = `${level}:${anchor}`;
        this.entryCounter[key] = 0; 
    }

    /**
     * Handle the log logic and routing
     */
    private  async print(level: ctxtLogLevel, option: ctxtCallConfig) {
        // Extract anchor
        let anchor = getCallerInfo();
        const tar = `#${anchor.fileName}${anchor.lineNumber}:${anchor.columnNumber}`

        // Register and threshold check
        const config = this.getConfig();
        const count = this.registerLogEntry(tar, level);
        const threshold = option.threshold ?? 0;

        if (count < threshold){ 
            return;
        } else {
             this.resetLogEntry(tar, level);
        }

        const logEntry = {
            level,
            message: option.send,
            origin: anchor,
            timeStamp: new Date().toISOString(),
            trace: option?.trace || null
        };

        // Handle silent flags
        const silentDev = config.silentInDev && process.env.NODE_ENV === "development";
        const silentProd = config.silentInProd && process.env.NODE_ENV === "production";

        if (!(silentDev || silentProd)) {
            console.log(`[CTXT/${level}][${tar}] → ${option.send} ${ option.trace ? "\n\n    Stack Trace : " + option.trace : "" }`);
        }
    }

    /**
     * Wrap a log level in a callable function
     */
    private createLogguer(type: ctxtLogLevel): ctxtLogguer {
        const self = this;
        return (option: ctxtCallConfig) => self.print(type, option);
    }

    public  log = this.createLogguer("log");

    public  info = this.createLogguer("info");
    
    public  success = this.createLogguer("success");

    public  warn = this.createLogguer("warn");

    public  error = this.createLogguer("error");

    public  fatal = this.createLogguer("fatal");

    public  assert(condition: boolean, config: ctxtCallConfig & { level?: ctxtLogLevel }) {
        if (!condition) 
            this.print(config.level ?? "warn", config);
    }
}
