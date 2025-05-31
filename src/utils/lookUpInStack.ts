/**
 * Utility to inspect the call stack at a given depth.
 *
 * @function lookUpInStack
 * @param {number} [at] - The stack depth to inspect. Defaults to `undefined`, which returns the full trace.
 *
 * @returns {Object} Stack information:
 * - `callerName` {string}: The name of the calling function, if found.
 * - `fileName` {string}: The path or file where the call occurred (without line/column).
 * - `lineNumber` {string | undefined}: The line number of the call.
 * - `columnNumber` {string | undefined}: The column number of the call.
 * - `fullTrace` {string[]}: The entire call stack trace (excluding the current function).
 *
 * @description
 * In a **synchronous context**, use:
 * - `at: 1` → returns where `lookUpInStack` itself was called.
 * - `at: 2` → returns the parent of the caller.
 *
 * In an **asynchronous context**, stack depth may vary. For example:
 * - `at: 7` → often corresponds to the actual parent call site.
 *
 * @example
 * 1 function caller() {
 * 2   return lookUpInStack(2);
 * 3 }
 * 4
 * 5 (function testCaller(){
 * 6    caller()
 * 7 })()
 * 8 
 * 9  // Output: {
 * 10 //   callerName: 'testCaller',
 * 11 //   fileName: '/path/to/file.js',
 * 12 //   lineNumber: '6',
 * 13 //   columnNumber: '5',
 * 14 //   fullTrace: [...]
 * 15 // }
 */
export function lookUpInStack(at?: number) {
    let anchor: string[] = Error()
        .stack?.split("\n")
        .map((str) => str.trim())
        .slice(1) as string[];

    if (!at) {
        return { fullTrace: anchor };
    }

    if (at && typeof at != "number") {
        console.warn(
            "invalid argument passed to lockUpInStack, expecting a number"
        );
        return { fullTrace: anchor };
    }

    if (!anchor[at]) {
        console.warn("invalid `at` index passed to lockUpInStack");
        return { fullTrace: anchor };
    }

    const part = anchor[at].replace(/^at/, "").trim().split(" ");
   
    const callerName = part.length > 1 
        ? part[0] 
        : "<TopLevel>";

    const fileName = part.length > 1 
        ? part.slice(1).join("") 
        : part[0];

    const lineNumber = fileName.split(":").at(-2);

    const columnNumber = fileName.split(":").at(-1);

    return {
        callerName,
        fileName: fileName.replace(/\:\d*\:\d*$/, ""),
        lineNumber,
        columnNumber,
        fullTrace: anchor.slice(1),
    };
}
