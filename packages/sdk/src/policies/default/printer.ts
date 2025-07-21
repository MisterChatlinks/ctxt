import { DevVariables } from "../../dev";
import { writeColoredString } from "../../printUtils/main";
import { LogInstance, LogLevel } from "@structs/log";
import { createStyledRenderer } from "./renderer";
import { isValidDate } from "@utils/types/main";
import { createFormating } from "./format";
import { ThemeManager } from "../../printUtils/theming";

export const Formatter = {

    dev(log: InstanceType<typeof LogInstance>, theme: ThemeManager, format: ReturnType<typeof createFormating>) {

        const str = writeColoredString((hr, cols, push, joinWith) => {
            joinWith("\n");

            const { dim, bold } = cols;

            const param = log.toObject();
            const renderer = createStyledRenderer(theme, cols);
            const level = param.level as LogLevel;

            const messages = Array.isArray(param.message)
                ? param.message
                : [param.message];

            const trace = param.meta;
            const rules = format[level];

            push("");
            push(renderer.separator(level, `[${[level]}]`, "left", { transform: "uppercase", style: "bold"}))
            
            push("");
            push(messages.join());

            if (rules.showTraceInfo) {      
                push("")
                renderer.trace(level, trace).forEach(push);
            }

            if (rules.showFullTrace) {
                push("")
                renderer.fullTrace(level, trace.fullTrace).forEach(push);
            }

            if (rules.showContext) {
                push("")
                renderer.context(level, param.context).forEach(push);
            }

            if (rules.showConfig) {
                push("")
                renderer.config(level, param.config).forEach(push);
            }

            let end = ""

            if (rules.showEnv) {
                end += `${DevVariables.detectEnv()}, `
                end = [end[0].toUpperCase(), end.split("").splice(1).join("").toLowerCase()].join("")
            }

            if (rules.showTimestamp) {
                end += (
                    `At ${isValidDate(param.timestamp)
                        ? new Date(param.timestamp).toLocaleString()
                        : new Date().toLocaleString()
                    }`
                )
            }

            push("")
            push(end)

            push(hr("", { char: bold("─"), color: (text: string) => bold(dim(text)) }))

        });

        console.log(...str);
    }
}

// export function devFomater(log: InstanceType<typeof LogInstance>) {

//     const str = writeColoredString(function (hr, cols, push, joinWith) {

//         joinWith("\n")

//         const param = log.toObject()

//         const { blue, yellow, red, green, redBright, magenta, bold, gray, whiteBright, cyan } = cols

//         const levels = {
//             info: blue,
//             warn: yellow,
//             error: red,
//             success: green,
//             fatal: redBright,
//             trace: magenta
//         } as const;

//         const color = levels[param.level as keyof typeof levels] || "gray";

//         const trace = param.meta;

//         const messages = Array.isArray(param.message)
//             ? param.message
//             : [param.message];

//         const context = param.context;
//         const config = param.config;

//         const rules = createFormating({});

//         const {
//             showEnv,
//             showContext,
//             showConfig,
//             showTimestamp,
//             showLineNumber,
//             showColumnNumber,
//             showCallerName,
//             showFileName,
//             showFullTrace,
//         } = rules[param.level];

//         push("\n");
//         push(hr("MONITEXT")); // centered label

//         push(
//             `\n${`${bold(color(`🟢 [${param.level.toUpperCase()}]`))} ${whiteBright(messages.join(" "))}`}`,
//         );

//         push(`\n${cyan("📌 StackTraceInfo:")}\n`);

//         if (showCallerName) {
//             push(
//                 `    • ${bold("Caller:")}   ${trace.callerName || "Unknown"}`,
//             );
//         }
//         if (showFileName) {
//             push(
//                 `    • ${bold("File:")}     ${shortenStackPath(trace.fileName, DevVariables.defaultBasePath) || "Unknown"}`,
//             );
//         }
//         if (showLineNumber) {
//             push(
//                 `    • ${bold("Line:")}     ${trace.lineNumber || "Unknown"}`,
//             );
//         }
//         if (showColumnNumber) {
//             push(
//                 `    • ${bold("Column:")}   ${trace.columnNumber || "Unknown"}`,
//             );
//         }
//         if (showFullTrace) {
//             push(`\n${yellow("📜 Full Trace:")}`);
//             push(
//                     Array.isArray(trace.fullTrace) && trace?.fullTrace
//                         .map(
//                             (l) =>
//                                 `   - ${shortenStackPath(l, DevVariables.defaultBasePath)}`,
//                         )
//                         .join("\n")
//                     || "    No stack trace available.",
//             );
//         } else {
//             push(
//                 `\n${yellow("📜 Full Trace:")} No stack trace available (disabled).`,
//             );
//         }

//         if (context && showContext) {
//             push(
//                 `\n${magenta("📦 Context:")} ${typeof context === "object"
//                     ? Object.keys(context)
//                         .map((c) => `   - ${c}: ${context[c]}`)
//                         .join("\n")
//                         .replace(/^(.*)/, "\n$1")
//                     : context || "No context available (undefined)"
//                 }`,
//             );
//         }

//         if (showConfig) {
//             push(
//                 `\n${magenta("⚙️  Config:")} ${typeof config === "object"
//                     ? Object.keys(config)
//                         .map((c) => `   - ${c}: ${config[c as keyof typeof config]}`)
//                         .join("\n")
//                         .replace(/^(.*)/, "\n$1")
//                     : config || "No config available (undefined)"
//                 }`,
//             );
//         }

//         if (showEnv) {
//             const env = DevVariables.detectEnv();
//             push(`\n${printRuntime(env as string)}`);
//         }

//         if (showTimestamp) {
//             push(hr(`\n${isValidDate(param.timestamp) ? new Date(param.timestamp).toLocaleString() : new Date().toLocaleDateString()}`, { char: " "}));
//         }

//         push("")

//         push(hr("LOG END", { char: "━", color: green, padding: 2 }));

//     })

//     console.log(...str)
// }
