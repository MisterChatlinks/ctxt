import { LogFormater } from "../../src-types/formater.types";

export const compactFormatFn: LogFormater = (data) => {
    const { level, meta, content  } = data;
    const meta_content = data["meta:content"];

    const time = (meta?.time as string)?.split("T")[1]?.split(".")[0] ?? "time?";
    const file = meta.fileName?.split("/").pop() ?? "file?";
    const line = meta.lineNumber ?? "?";

    const shortMeta = (() => {
        const entries = Object.entries(meta_content ?? {});
        if (entries.length === 0) return "";
        return entries
            .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
            .join(" | ");
    })();

    const output = `[${level.toUpperCase()}] ${content.join(" ")} @ ${time}`
        + (shortMeta ? ` | ${shortMeta}` : "")
        + ((level === "error" || level === "warn") ? ` | file: ${file}:${line}` : "");

    return output
}