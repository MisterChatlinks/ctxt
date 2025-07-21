import { DevVariables } from "../dev";
import { cols } from "./colorPack";
import { parseStyleTags, renderStyleTreeBrowser, renderStyleTreeNode } from "./interpreter";
import { hr } from "./prettyPrint";

export function writeColoredString(
    fn: (
        h: typeof hr,
        col: typeof cols,
        push: (str: string | string[]) => void,
        join: (str: string) => void,
    ) => void,
    env = DevVariables.detectEnv()
) {
    let char = ""

    const input: (string | string[])[] = [];

    const push = function (c: string | string[]) {
        input.push(c);
    };

    const joinWith = function (c: string) {
        char = c
    };

    fn(hr, cols, push, joinWith);

    const intermediate = parseStyleTags(input.flat().join(char));

    const result = env === "browser"
        ? renderStyleTreeBrowser(intermediate).flat()
        : [renderStyleTreeNode(intermediate)]

    return result
}


