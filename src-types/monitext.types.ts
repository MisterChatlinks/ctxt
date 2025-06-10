import type { MTLogguer } from "../src/logguer"
import type { lookUpInStack } from "../src/utils/lookUpInStack"
import { loggingFormat } from "./formater.types"

export type LogLevel = 
    | "info"
    | "success" 
    | "warn"
    | "error"
    | "fatal"

export type scheduleEntrie = {
    content: unknown[],    
    config?: logConfig
    level: LogLevel,
    meta: ReturnType<typeof lookUpInStack> & Record<string, unknown>
    ref: symbol
    "meta:content"?: Record<string, unknown>
}

type alertOption = "sms" | "call" | "mail"

export type logConfig = {
    threshold?: number,
    silent?: boolean,
    class?: string,
    use?: alertOption[],
    send?: boolean,
    flag?: string[]
}

export interface MTConf {
    env: "node" | "web" | "deno"
    apiKey: string,
    apiUrl?: string, // Optional API endpoint
    encryptPayload?: (payload: string, apiKey: string) => string | Promise<string>, // Enable/disable encryption
    devMode: boolean,
    silent: (LogLevel)[],
    project_name: string,
    format: loggingFormat
    fallback?: ((logs: scheduleEntrie[]) => void | unknown) | null,
    fallbackFilePath?: string
    useDefaultFallback?: boolean
    transportationDelay?: number
    backOffDelay?: number
}

export type VerboseLogObject = {
    config: MTLogguer["config"],
    send: MTLogguer["send"],
    withMeta: MTLogguer["withMeta"]
}

export type MetaType = scheduleEntrie["meta:content"]

export type VerboseLogFn = (...stmt: unknown[]) => VerboseLogObject;

export type CompactArgs = {meta?: MetaType, conf?: logConfig };

export type CompactLogFn = (log: string, param?: CompactArgs) => void;


export interface VerboseLogger  {
    info: VerboseLogFn;
    error: VerboseLogFn;
    warn: VerboseLogFn;
    success: VerboseLogFn;
    fatal: VerboseLogFn;
    defLogguer: DefVerboseLogguerFn;
} 

export interface CompactLogger {
    info: CompactLogFn;
    error: CompactLogFn;
    warn: CompactLogFn;
    success: CompactLogFn;
    fatal: CompactLogFn;
    defLogguer: DefCompactLogguerFn;
}

/**
 * There's a duplicate entry of ...Logguer / ...LogDef cause TS do not quite well compile expression like (ThisType & ThatType) to simple javascript
*/

export type DefLoggerFn = (identifyer: string, config?: logConfig) => (CompactLogDef | VerboseLogDef);

export type DefCompactLogguerFn = (identifyer: string, config?: logConfig) => CompactLogDef;

export type DefVerboseLogguerFn = (identifyer: string, config?: logConfig) => VerboseLogDef;

export interface CompactLogDef {
    info: CompactLogFn;
    error: CompactLogFn;
    warn: CompactLogFn;
    success: CompactLogFn;
    fatal: CompactLogFn;
}

export interface VerboseLogDef {
    info: VerboseLogFn;
    error: VerboseLogFn;
    warn: VerboseLogFn;
    success: VerboseLogFn;
    fatal: VerboseLogFn;
}