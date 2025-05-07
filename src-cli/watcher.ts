import { watch } from "fs";
import { buildCtxt } from "./builder";

export function watchConfig(configPath: string) {
  console.log(`👀 Watching ${configPath} for changes...`);
  watch(configPath, (eventType) => {
    if (eventType === "change") {
      console.log("🔄 Config changed. Rebuilding...");
      buildCtxt(configPath);      
      console.log("📦 Recompiled ctxt to dist/ in both ESM and CJS formats.");
    }
  });
}