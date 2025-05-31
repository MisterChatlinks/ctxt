import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export const getPathInConfigMapper = (file: string)=>  join(__dirname, "configMap", file);

export const readInConfigMap = (file: string) => {
    return readFileSync(
        getPathInConfigMapper(file),
        { encoding: "utf-8" }
    )
}

export const writeInConfigMap = (file: string, content: string) => {
    writeFileSync(
        getPathInConfigMapper(file), content,{ encoding: "utf-8" }
    )
}

