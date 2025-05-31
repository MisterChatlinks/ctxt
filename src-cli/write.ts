import { writeFileSync } from "fs";
import { join } from "path";
import { injectPathAliasIfPossible } from "./alias";
import { jsonFormat } from "../src/utils/jsonFormat";
import { PackageName, RuntimeFileName } from "./devVar";

export function writeMonitextRuntime(at: string, config: Record<string, unknown>, type: ".js" | ".ts" | ".cjs") {
    const inputConf = jsonFormat(config);

    const inputTemplate = (templateConf: string) => {
        switch (type) {
            case ".cjs":
                return [
                    `const defineMonitextRuntime = require("${PackageName}").default`,
                    `const { mtxt, monitext } = defineMonitextRuntime(${templateConf})`,
                    `module.exports = { mtxt, monitext }`
                ].join("\n");

            default:
                return [
                    `import defineMonitextRuntime from "${PackageName}"`,
                    `export const { mtxt, monitext } = defineMonitextRuntime(${templateConf})`,
                ].join("\n");
        }
    };

    const baseFile = RuntimeFileName;
    const runtimeFile = `${baseFile}${type}`;
    const runtimePath = join(at, runtimeFile);

    // Write the runtime file
    writeFileSync(runtimePath, inputTemplate(inputConf), { encoding: "utf-8" });

    try {
        injectPathAliasIfPossible(at, runtimeFile);
    } catch (e) {
        console.warn("Could not inject path alias automatically:", (e as Error).message, (e as Error).stack);
    }
}