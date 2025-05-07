import { cwd } from "node:process";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

export function buildCtxt(outPath: string) {
    const includeStmt = `import config from "${readFileSync(join(__dirname, "mtxt-config.path"), { encoding: "utf8" }).replace(/\.ts$/, "")}"`; 
    const indexTemplate = 
`${includeStmt.replace(/\.ts$/, "")}
import consoleDotTXT from "./mtxt";
const mtxt = new consoleDotTXT();
consoleDotTXT.init(config);
export default mtxt;
`;

    writeFileSync(join(__dirname, "..", "src", "index.ts"), indexTemplate, { encoding: "utf-8" });

    spawn("npm", ["run", "build"], { stdio: "inherit", shell: true, "cwd": join(__dirname, "..") });
}
