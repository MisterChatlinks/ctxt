import { MTLogguer } from "../src/logguer"

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
    meta: Record<string, number | string | boolean | null | undefined>
    ref: symbol
    "meta:content"?: Record<string, number | string | boolean | null | undefined>
}

type alertOption = "sms" | "call" | "mail"

export type logConfig = {
    threshold?: number,
    silent?: boolean,
    class?: string,
    use?: alertOption[],
}

export interface MTConf {
    env: "node" | "web"
    apiKey: string,
    devMode: boolean,
    silent: LogLevel[],
    project_name: string,
}

export type VerboseLogObject = {
    config: MTLogguer["config"],
    send: MTLogguer["send"],
    withMeta: MTLogguer["withMeta"]
}

export type MetaType = scheduleEntrie["meta:content"]

export type VerboseLogFn = (...stmt: unknown[]) => VerboseLogObject;

export type CompactLogFn = (log: string, meta?: MetaType, conf?: logConfig) => { send: () => void };

export interface VerboseLogger {
    info: VerboseLogFn;
    error: VerboseLogFn;
    warn: VerboseLogFn;
    success: VerboseLogFn;
}

export interface CompactLogger {
    info: CompactLogFn;
    error: CompactLogFn;
    warn: CompactLogFn;
    success: CompactLogFn;
}
