import { cwd } from "node:process";
import { join } from "node:path";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { readInConfigMap, writeInConfigMap } from "./utils";
import { userConfigPathRefFileIsFileName } from "./devVar";

export function buildCtxt(outPath: string) {

    let userConfigPath = readInConfigMap(userConfigPathRefFileIsFileName);

    if(userConfigPath.endsWith(".ts")){
        userConfigPath = userConfigPath.replace(/\.ts$/, "");
    }

    const includeStmt = `import config from "${userConfigPath}"`; 
    
    const indexTemplate = (`
        ${ includeStmt }
        import consoleDotTXT from "./mtxt";
        const mtxt = new consoleDotTXT();
        consoleDotTXT.init(config);
        export default mtxt;
        export const log = mtxt.log;
        export const info = mtxt.info;
        export const success = mtxt.success;
        export const error = mtxt.error;
        export const fatal = mtxt.fatal;
        export const assert = mtxt.assert;
    `).trim();

    // rewrite the index file from whitch the user import the `mtxt` lib
    writeFileSync(join(__dirname, "..", "src", "index.ts"), indexTemplate, { encoding: "utf-8" });

    // rebuild the pkg
    spawn("npm", ["run", "build"], { stdio: "inherit", shell: true, "cwd": join(__dirname, "..") });
}
