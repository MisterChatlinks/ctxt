import { watch } from "fs";
import { buildCtxt } from "./builder";

const log = console.log;
const parameters = {
  interval: 100,
  timeoutId: null as NodeJS.Timeout | null
};

const commitConfig = (configPath: string) => {
  log("🔄 Config changed. Rebuilding...");
  buildCtxt(configPath);
  log("📦 Recompiled ctxt to dist/ in both ESM and CJS formats.\n");
};

export function watchConfig(configPath: string) {
  log(`👀 Watching ${configPath} for changes...`);

  watch(configPath, (e) => {
    if (e !== "change") return;

    if (parameters.timeoutId) {
      clearTimeout(parameters.timeoutId);
    }

    parameters.timeoutId = setTimeout(() => {
      commitConfig(configPath);
      parameters.timeoutId = null;
    }, parameters.interval);
  });
}
