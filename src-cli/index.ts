#!/usr/bin/env node

import { Command } from "commander";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const program = new Command();

program
  .name("monitext")
  .description("MoniText CLI utility")
  .version("3.0.0");

program
  .command("init")
  .description("Generate a MoniText runtime config file")
  .option("-o, --output <file>", "Output file path", "monitext.runtime.ts")
  .option("--apiKey <key>", "Set the default API key", "")
  .option("--project <name>", "Set the default project name", "")
  .option("--mode <env>", "Set formatting mode: dev | prod", "dev")
  .action((options) => {
    const filePath = path.resolve(process.cwd(), options.output);
    const dir = path.dirname(filePath);
    const content = `import { createRuntime, getPolicyRecord } from "monitext";

const { createFormating, createConfig, policies } = getPolicyRecord("default");

const format = createFormating({
  mode: "${options.mode}",
  success: { 
    showColumnNumber: false,
    showFullTrace: false
  },
});

const config = createConfig({
  apiKey: "${options.apiKey}",
  project: "${options.project}",
  silence: ["info"]
});

export const { monitext, mtxt } = createRuntime({ config, load: [...policies], format });
`;

    try {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(filePath, content);
      console.log(`✅ MoniText runtime initialized at: ${filePath}`);
    } catch (err) {
      console.error("❌ Failed to write MoniText runtime file:", err);
      process.exit(1);
    }
  });

program.parse();
