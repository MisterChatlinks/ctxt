import { DevVariables } from "../dev";
import { cols } from "./colorPack";

const { green, bold, gray } = cols

/**
 * Prints a styled horizontal rule (like <hr>) to the console, adapting to terminal width.
 *
 * @param title Optional label to center within the line.
 * @param opts Optional customization:
 *  - char: the fill character (default: '─')
 *  - color: chalk color function (default: chalk.gray)
 *  - padding: space around the title (default: 1)
 */
export function hr(
    title: string = "",
    opts: {
        char?: string;
        color?: (text: string) => string;
        padding?: number;
    } = {},
): string {
    let terminalWidth = getTerminalWidth(80);

    const char = opts.char ?? "─";
    const color = opts.color ?? gray;
    const pad = " ".repeat(opts.padding ?? 1);

    const cleanTitle = title ? `${pad}${title.trim()}${pad}` : "";
    const lineLength = Math.max(0, terminalWidth - cleanTitle.length);
    const leftLen = Math.floor(lineLength / 2);
    const rightLen = lineLength - leftLen;

    const line = char.repeat(leftLen) + cleanTitle + char.repeat(rightLen);
    return color(line);
}




/**
 * Attempts to determine the terminal width in characters.
 *
 * @param defaultWidth Fallback width if detection fails (default: 80).
 * @returns The terminal width in characters.
 */
export function getTerminalWidth(defaultWidth = 80): number {
    const env = DevVariables.detectEnv();

    switch (env) {
        case "bun":
            return process.stdout?.columns || defaultWidth; // Bun environment
        case "node":
            return process.stdout?.columns || defaultWidth; // Node.js environment
        case "deno":
            return Deno.consoleSize().columns || defaultWidth; // Deno environment
        case "browser":
            let length;
            try {
                length = Math.floor(window.innerWidth / 8); // Rough estimate of characters per line
                return length > 0 ? length : defaultWidth; // Ensure positive width
            } catch (error) {
                return defaultWidth; // Fallback for browser errors
            }
        default:
            return defaultWidth; // Fallback for unknown environments
    }
}

export function printRuntime(env: string, col:  typeof cols.bgBlue = green) {
    const icons = {
        node: "🟢",
        deno: "🦕",
        bun: "🍞",
        browser: "🌐",
        other: "❓",
    } as const;

    const names = {
        node: "Node.js",
        deno: "Deno",
        bun: "Bun",
        browser: "Browser",
        other: "Unknown",
    } as const;

    const icon = icons[env as keyof typeof icons] ?? icons.other;
    const name = names[env as keyof typeof names] ?? names.other;

    return (`${col(bold(icon))} ${col(bold(name))} ${
        col(bold("Runtime"))
    }`);
}