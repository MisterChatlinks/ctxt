import type { scheduleEntrie } from "./monitext.types";

export interface logFormat {
    "level": scheduleEntrie["level"];
    "meta": scheduleEntrie["meta"];
    "content": scheduleEntrie["content"];
    "meta:content"?: scheduleEntrie["meta:content"];
}

export type LogFormater = (data: logFormat) => string | object;

export type loggingFormat = "dev" | "json" | "compact"