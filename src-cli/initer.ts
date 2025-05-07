import inquirer from "inquirer";
import { join } from "path";
import { writeFileSync, existsSync } from "fs";

const log = (...args: unknown[]) => {
    const msg = args.join(" ");
    console.log(`\n${msg}\n${"=".repeat(msg.length)}\n`);
};

const mkTemplate = (template: Record<string, any>) => {
    const { apiKey, devMode, ...rest } = template;
  
    let configString = `// Auto-generated CTXT config file\n`;
    configString += `// - Never expose devMode = true or API keys in production bundles\n\n`;
  
    const partialConfig = {
      ...rest,
      devMode,
      apiKey: apiKey ? apiKey : "<YOUR_API_KEY>",
    };
  
    configString += `const config = ${JSON.stringify(partialConfig, null, 2)};\n\n`;
    configString += `export default config;\n`;
  
    return configString;
};  

export async function initCtxt(outPath: string) {
    log("| ✨ CTXT Config helper");

    let answers = await (inquirer.prompt as any)([
        {
            name: "project_name",
            message: "What is your project name?",
        },
        {
            name: "env",
            message: "In which environment do you plan to run?",
            type: "list",
            choices: ["node", "browser"],
        },
        {
            name: "apiKey",
            message: "Where is your API key?",
        }
    ]);

    if (answers.env === "node") {
        
        log("Since you're running in Node, let's configure some advanced options:");

        const optional = await (inquirer.prompt as any)([
            {
                name: "handleException",
                message: "Handle exceptions automatically?",
                type: "confirm",
            },
            {
                name: "handleRejection",
                message: "Handle unhandled rejections automatically?",
                type: "confirm",
            },
            {
                name: "include",
                message:
                    "Specify comma-separated list of folders/files to include (e.g. src/*,lib/**)",
                type: "input",
                filter: (val: string) =>
                    val ? val.split(",").map((s) => s.trim()) : undefined,
                default: "src/*",
            },
            {
                name: "exclude",
                message:
                    "Specify comma-separated list of folders/files to exclude (e.g. tests/*,build/**)",
                type: "input",
                filter: (val: string) =>
                    val ? val.split(",").map((s) => s.trim()) : undefined,
            },
            {
                name: "devMode",
                message: "Is this project currently in development mode?",
                type: "confirm",
                default: true,
            },
        ]);

        answers = { ...answers, ...optional };
    }

    if (existsSync(outPath)) {
        log(`⚠️ The file "ctxtconfig.ts" already exists.`);

        const { overwrite } = await inquirer.prompt([
            {
                name: "overwrite",
                message: "Do you want to overwrite it?",
                type: "confirm",
                default: false,
            },
        ]);

        if (!overwrite) {
            log("❌ Aborted. Config file not modified.");
            return outPath;
        }
    }

    writeFileSync(outPath, mkTemplate({ ...answers }));
   
    writeFileSync(join(__dirname, "mtxt-config.path" ), outPath, { encoding: "utf-8" })
    
    log("✅ Created mtxt-config.ts");

    return outPath
}