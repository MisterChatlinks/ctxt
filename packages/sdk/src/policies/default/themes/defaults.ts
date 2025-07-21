import { ThemeConfig } from "../../../printUtils/theming";

export const DefaultDevTheme: ThemeConfig = {
    // Define common properties that apply to all log levels
    common: {
        contextColor: "white",
        configColor: "white",
        metaLabelColor: "white",
        separatorChar: "━",
        headerStyle: "white", // Moved here as it's common
    },
    info: {
        icon: "🟦",
        color: "blue",
        traceColor: "cyan",
    },
    warn: {
        icon: "⚠️",
        color: "yellow",
        traceColor: "yellow",
    },
    error: {
        icon: "🟥",
        color: "red",
        traceColor: "red",
    },
    success: {
        icon: "✅",
        color: "green",
        traceColor: "green",
    },
    failure: { // Suggesting a change for failure to make it distinct
        icon: "❌", // Changed icon
        color: "yellowBright", // Changed color
        traceColor: "yellowBright",
    },
    fatal: {
        icon: "💀",
        color: "redBright",
        traceColor: "redBright",
    },
    trace: {
        icon: "🔍",
        color: "magenta",
        traceColor: "cyan", // 'traceColor' for 'trace' level often different than its own 'color'
    },
    profile: {
        icon: "⏱️", // Changed icon to suggest time/performance
        color: "cyan", // Changed color to differentiate from trace
        traceColor: "cyan",
    },
};

// export const DefaultDevTheme: ThemeConfig = {
//     common: {
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//         headerStyle: "bold", // Moved here as it's common
//     },
//     info: {
//         icon: "🟦",
//         color: "blue",
//         headerStyle: "bold",
//         traceColor: "cyan",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     warn: {
//         icon: "⚠️",
//         color: "yellow",
//         headerStyle: "bold",
//         traceColor: "yellow",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     error: {
//         icon: "🟥",
//         color: "red",
//         headerStyle: "dim",
//         traceColor: "red",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     success: {
//         icon: "✅",
//         color: "green",
//         headerStyle: "bold",
//         traceColor: "green",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     failure: {
//         icon: "❌",
//         color: "cyan",
//         headerStyle: "bold",
//         traceColor: "green",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     fatal: {
//         icon: "💀",
//         color: "redBright",
//         headerStyle: "bold",
//         traceColor: "redBright",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     trace: {
//         icon: "🔍",
//         color: "magenta",
//         headerStyle: "bold",
//         traceColor: "cyan",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
//     profile: {
//         icon: "⏱️",
//         color: "magentaBright",
//         headerStyle: "bold",
//         traceColor: "cyan",
//         contextColor: "magenta",
//         configColor: "magenta",
//         metaLabelColor: "yellow",
//         separatorChar: "━",
//     },
// };
