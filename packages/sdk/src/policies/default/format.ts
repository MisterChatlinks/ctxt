import { Config, createConfigResolver } from "../../core/config";

/**
 * Default formatting options for log output in development mode.
 * Each option toggles the visibility of a specific part of the log entry.
 */
export const FormatingPreset = {
    /** Display the environment (e.g., node, deno, bun, browser) */
    showEnv: true,

    /** Display timestamp in log output */
    showTimestamp: true,

    /** Include the context object (if any) */
    showContext: true,

    /** Display the configuration object in the log (usually hidden) */
    showConfig: false,

    /** Show the name of the function/method that emitted the log */
    showCallerName: true,

    /** Show the file path of the log origin */
    showFileName: true,

    /** Show the line number from where the log was called */
    showLineNumber: true,

    /** Show the column number (less useful unless debugging minified code) */
    showColumnNumber: false,

    /** Include the full stack trace */
    showFullTrace: false,

    showTraceInfo: true
};


const createFormatingRule = createConfigResolver(new Config(FormatingPreset))
const errorLevelsFormating = createFormatingRule({ showFullTrace: true }) as Partial<typeof FormatingPreset>
const commonLevelsFormating = createFormatingRule({ showColumnNumber: false }) as Partial<typeof FormatingPreset>

export const createFormating = createConfigResolver(new Config({
    /** Desired logging style/theme */
    mode: "dev" as "dev" | "json" | "compact",
    info: commonLevelsFormating,
    warn: commonLevelsFormating,
    error: errorLevelsFormating,
    fatal: errorLevelsFormating,
    trace: commonLevelsFormating,
    profile: commonLevelsFormating,
    failure: commonLevelsFormating,
    success: commonLevelsFormating,
}));