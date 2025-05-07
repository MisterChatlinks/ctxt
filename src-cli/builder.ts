import { cwd } from "node:process";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

export function buildCtxt(outPath: string) {
    const includeStmt = `import config from "${outPath.replace(/\.ts$/, "")}"`;
    
    const indexTemplate = 
`${includeStmt}

import consoleDotTXT from "./ctxt";
const ctxt = new consoleDotTXT();
consoleDotTXT.init(config);
export default ctxt;
`;

    writeFileSync(join(".", "src", "index.ts"), indexTemplate);
    
    spawn("npm", ["run", "build"], { stdio: "inherit", shell: true });
}
