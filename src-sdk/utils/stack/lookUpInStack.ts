import { DevVariables } from "../../../dev";

/**
 * Represents information extracted from a specific stack trace frame.
 */
export class StackTraceInfo {
    /**
     * @param callerName {string} - Name of the calling function.
     * @param fileName {string} - The file path or name where the call occurred.
     * @param lineNumber {string | undefined} - The line number within the file.
     * @param columnNumber {string | undefined} - The column number within the line.
     * @param fullTrace {string[]} - The full captured stack trace.
     */
    constructor(
        public readonly callerName: string,
        public readonly fileName: string,
        public readonly lineNumber: string | undefined,
        public readonly columnNumber: string | undefined,
        public readonly fullTrace: string[]
    ) {}
}

/**
 * Type alias for instances of StackTraceInfo.
 */
export type StackInfo = InstanceType<typeof StackTraceInfo>;

/**
 * Type guard to check if a value is a valid StackTraceInfo.
 * 
 * @param obj {any} - Object to validate.
 * @returns {obj is StackInfo}
 */
export function isStackInfo(obj: any): obj is StackInfo {
    return obj instanceof StackTraceInfo;
}

const isShapedLikeLookSetup = (maybeSetup: object)=> typeof maybeSetup === "object" && maybeSetup !== null && ["node", "deno", "bun", "browser"].every((k) => typeof maybeSetup[k as keyof LookSetup & keyof typeof maybeSetup]  === "number");

/**
 * Environment-specific configuration to determine stack trace lookup depth.
 */
export class LookSetup {
    node: number;
    deno: number;
    bun: number;
    browser: number;
    defaults?: number;

    /**
     * @param config {Object} - Stack depth configuration per environment.
     * @param config.node {number} - Stack depth for Node.js.
     * @param config.deno {number} - Stack depth for Deno.
     * @param config.bun {number} - Stack depth for Bun.
     * @param config.browser {number} - Stack depth for browser environments.
     * @param config.defaults {number} - Default fallback depth if environment is unknown.
     */
    constructor({ node, deno, bun, browser, defaults }: LookSetup) {
        this.node = node || 2;
        this.deno = deno || 2;
        this.bun = bun || 2;
        this.browser = browser || 2;
        this.defaults = defaults || 2;
    }
}

/**
 * @function lookUpInStack
 * 
 * @purpose Extracts caller stack information at a specified depth.
 * 
 * @param {number | LookSetup} [at] - Stack index to inspect or an instance of `LookSetup`
 * which dynamically chooses based on runtime environment (Node, Deno, Bun, or browser).
 *
 * @returns {StackTraceInfo | { fullTrace: string[] }} Either structured stack trace data or raw stack lines.
 *
 * @example
 * ```ts
 * // Basic example
 * function foo() {
 *   return lookUpInStack(2);
 * }
 *
 * (function main(){
 *   console.log(foo());
 * })();
 * ```
 *
 * @example
 * ```ts
 * // Dynamic per-runtime config:
 * const setup = new LookSetup({ node: 2, deno: 3, bun: 5, browser: 4, defaults: 2 });
 * const info = lookUpInStack(setup);
 * ```
 *
 * @description
 * This function is useful for:
 * - Debugging tools
 * - Runtime logging
 * - Function introspection
 * - Developer utilities that need to trace call origins
 *
 * @remarks
 * The function tries to extract:
 * - The calling function name
 * - Source file
 * - Line and column number
 *
 * In **asynchronous stacks**, actual depth may vary, so manual tuning via `LookSetup` is recommended.
 */
export function lookUpInStack(at: number | LookSetup | typeof LookSetup) {
    let anchor: string[] = Error()
        .stack?.split("\n")
        .map((str) => str.trim())
        .slice(1) as string[];

        if (typeof at !== "number") 
            {
            const maybeSetup = at as Partial<LookSetup>;
            if (at instanceof LookSetup) {
                at = (at[DevVariables.detectEnv() as keyof typeof at] || at.defaults) as number;
            } 
            else if (isShapedLikeLookSetup(maybeSetup)) {
                at = new LookSetup(maybeSetup as LookSetup);
                at = (at[DevVariables.detectEnv() as keyof typeof at] || at.defaults) as number;
            } 
            else {
                console.warn(`[lookUpInStack] Invalid \`at\` value. Expected number or LookSetup-compatible object, received:`, at);
                return { fullTrace: anchor };
            }
        }

    const stackLength = anchor.length - 1;

    if (at < 0 || at > stackLength || !Number.isInteger(at)) {
        console.warn(`[lookUpInStack] invalid \`at\` index, must be between 0 and ${stackLength}; received: ${at}`);
        return { fullTrace: anchor };
    }

    const targetLine = anchor[at].replace(/^at/, "").trim().split(" ");
    const targetLineLength = targetLine.length;

    if (!targetLine || targetLineLength === 0) {
        console.warn(`[lookUpInStack] No valid stack trace found at index ${at}`);
        return { fullTrace: anchor };
    }

    const IsTheCallerKnown = targetLineLength > 1;

    const callerName = IsTheCallerKnown
        ? targetLine[0]
        : "<unknown>";

    const fileName = IsTheCallerKnown
        ? targetLine.slice(1).join("")
        : targetLine[0];

    const fileNameParts = fileName.split(":");
    const fileNamePartsLength = fileNameParts.length;

    const lineNumber = fileNamePartsLength > 2
        ? fileNameParts[fileNamePartsLength - 2]
        : fileNameParts[fileNamePartsLength - 1].replace(")", "");

    const columnNumber = fileNamePartsLength > 2
        ? fileNameParts[fileNamePartsLength - 1]
        : "0";

    return new StackTraceInfo(
        callerName,
        fileName.replace(/\:\d*\:\d*$/, ""),
        lineNumber,
        columnNumber.replace(")", ""),
        anchor
    );
}

//!!! TO DO REMOVE THIS DOWN HERE

// import { DevVariables } from "dev";

// class StackTraceInfo {
//     constructor(
//         public readonly callerName: string,
//         public readonly fileName: string,
//         public readonly lineNumber: string | undefined,
//         public readonly columnNumber: string | undefined,
//         public readonly fullTrace: string[]
//     ) {}
// }

// export type StackInfo = InstanceType<typeof StackTraceInfo>;

// export function isStackInfo(obj: any): obj is StackInfo {
//     return obj instanceof StackTraceInfo;
// }

// export class LookSetup {
//     node: number;
//     deno: number;
//     bun: number;
//     browser: number;
//     defaults?: number;
    
//     constructor({ node, deno, bun, browser, defaults }: LookSetup) {
//         this.node = node || 2;
//         this.deno = deno || 2;
//         this.bun = bun || 2;
//         this.browser = browser || 2;
//         this.defaults = defaults || 2;
//     }
// }

// /**
//  * @function lookUpInStack
//  * 
//  * @purpose Utility to inspect the call stack at a given depth, support Browser, Node, Deno, Bun.
//  * 
//  * @param {number} [at] - The stack depth to inspect. Defaults to `undefined`, which returns the full trace.
//  *
//  * @returns { StackTraceInfo | { fullTrace: string[]} } 
//  * Stack information:
//  * - `callerName` {string}: The name of the calling function, if found.
//  * - `fileName` {string}: The path or file where the call occurred (without line/column).
//  * - `lineNumber` {string | undefined}: The line number of the call.
//  * - `columnNumber` {string | undefined}: The column number of the call.
//  * - `fullTrace` {string[]}: The entire call stack trace (excluding the current function).
//  *
//  * @description
//  * In a **synchronous context**, use:
//  * - `at: 1` → returns where `lookUpInStack` itself was called.
//  * - `at: 2` → returns the parent of the caller.
//  *
//  * In an **asynchronous context**, stack depth may vary. For example:
//  * - `at: 7` → often corresponds to the actual parent call site.
//  *
//  * @example
//  * 1 function caller() {
//  * 2   return lookUpInStack(2);
//  * 3 }
//  * 4
//  * 5 (function testCaller(){
//  * 6    caller()
//  * 7 })()
//  * 8 
//  * 9  // Output: {
//  * 10 //   callerName: 'testCaller',
//  * 11 //   fileName: '/path/to/file.js',
//  * 12 //   lineNumber: '6',
//  * 13 //   columnNumber: '5',
//  * 14 //   fullTrace: [...]
//  * 15 // }
//  */
// export function lookUpInStack(at: number | LookSetup) {

//     let anchor: string[] = Error()
//         .stack?.split("\n")
//         .map((str) => str.trim())
//         .slice(1) as string[];

//     if (!at || typeof at !== "number"
//         && typeof at !== "object"
//         && !((at as LookSetup) instanceof LookSetup)
//     ) {
//         console.warn(`[lookUpInStack] invalid \`at\` index passed to lookUpInStack, must be a number or lookSetup received: ${at}`);
//         return { fullTrace: anchor };
//     }

//     at = typeof at === "number" ? at : (at[DevVariables.detectEnv() as keyof typeof at] || (at as LookSetup).defaults) as number

//     const stackLength = anchor.length - 1;

//     if (at < 0 || at > stackLength || !Number.isInteger(at)) {
//         console.warn(`[lookUpInStack] invalid \`at\` index passed to lookUpInStack, must be between 0 and ${stackLength - 1}; received: ${at}`);
//         return { fullTrace: anchor };
//     }

//     const targetLine = anchor[at].replace(/^at/, "").trim().split(" ");
//     const targetLineLength = targetLine.length;

//     if (!targetLine || targetLineLength === 0) {
//         console.warn(`[lookUpInStack] No valid stack trace found at index ${at}`);
//         return { fullTrace: anchor };
//     }

//     const IsTheCallerKnown = targetLineLength > 1;


//     const callerName = IsTheCallerKnown
//         ? targetLine[0]
//         : "<unknown>"

//     console.warn(anchor)

//     const fileName = IsTheCallerKnown
//         ? (targetLine.slice(1)).join("")
//         : targetLine[0];

//     const fileNameParts = fileName.split(":");
//     const fileNmaePartsLength = fileNameParts.length;

//     const lineNumber = fileNmaePartsLength > 2
//         ? fileNameParts[fileNmaePartsLength - 2]
//         : fileNameParts[fileNmaePartsLength - 1].replace(")", ""); // bun does not include column num if equal to 0

//     const columnNumber = (fileName.split(":").length > 2
//         ? fileNameParts[fileNmaePartsLength - 1]
//         : "0" // bun does not include column if equal to 0
//     )?.replace(")", "");

//     return new StackTraceInfo(
//         callerName,
//         fileName.replace(/\:\d*\:\d*$/, ""),
//         lineNumber,
//         columnNumber,
//         anchor,
//     );
// }


