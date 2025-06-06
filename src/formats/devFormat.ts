import type { LogFormater } from "../../src-types/formater.types";

export const devFormatFn: LogFormater = (data) => {
    const { level, meta, content } = data;
    const meta_content = data["meta:content"];

    let format = `\n[MoniTexT/${level.toUpperCase()}]`;

    // Primary message
    if (Array.isArray(content)) {
        format += "\nmessage: " + content.map(e => 
            typeof e === 'string' ? e : JSON.stringify(e, null, 2)
        ).join(" ");
    } else {
        format += "\nmessage: " + (typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    }

    // Basic Meta Info
    format += "\n  file: " + (meta.fileName || "unknown") +
              "\n  line: " + (meta.lineNumber || "?") +
              "\n  col: " + (meta.columnNumber || "?");

    // Trace if available
    if (
        ["fatal", "error"].includes(level) && meta.fullTrace?.length) 
    {
        format += "\ntrace:\n  " + meta.fullTrace.join("\n  ");
    }

    // Meta Content
    const metaKeys = Object.keys(meta_content || {});

    if (metaKeys.length > 0) {
        format += "\nmeta:";
        for (const key of metaKeys) {
            const val = meta_content![key];
            format += `\n  ${key}: ${typeof val === 'object' ? JSON.stringify(val, null, 2) : val}`;
        }
    }

    // Timestamp
    if (meta.time) {
        format += `\ntime: ${meta.time}`;
    }

    // Print to console
    return format;
} 