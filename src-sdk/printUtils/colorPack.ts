import { chalkCSSPolify, ChalkStyleKeys } from "./browserPolify";
import { createStyleTag } from "./interpreter";


function createColorFn(col: ChalkStyleKeys) {
    return function (...message: string[]) {
       return createStyleTag(col, ...message)
    }
}

const colorHelpers = {} as { [K in ChalkStyleKeys]: ReturnType<typeof createColorFn> };

for(const keys of Object.keys(chalkCSSPolify)){
    colorHelpers[keys as ChalkStyleKeys] = createColorFn(keys as ChalkStyleKeys)
}

export const cols = colorHelpers


