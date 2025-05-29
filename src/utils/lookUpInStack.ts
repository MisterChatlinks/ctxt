/**
 * @purpose  utility function meant to allow stack look up at a given index
 * @param { Number } at - the index from of with to return the stack info
 *
 * @note
 *  - at 1: bring back where the lookUpInStack function is called
 *
 * In Synchonous func : `
 *  - at 2: where it's parent is called
 *
 * In Async func
 * - at 7: where it's parent is called
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
        : "<anonymousFunction>";

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
