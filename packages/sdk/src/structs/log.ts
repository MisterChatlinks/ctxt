import { DevVariables } from "../dev";
import { createStructFromShape } from "../core/struct";
import { isValidDate } from "../utils/types/main";
import { StackInfo } from "../utils/stack/main";
import { writeMonitextError } from "../utils/write/main";

/**
 * List of supported log levels for output filtering and formatting.
 */
export const LogLevels = [
    "info",
    "warn",
    "error",
    "fatal",
    "trace",
    "profile",
    "success",
    "failure",
] as const;

/**
 * Union type representing all valid log levels.
 */
export type LogLevel = typeof LogLevels[number];

/**
 * Base shape used for creating structured log entries.
 * Each property is type-safe and reflects a field in the log output.
 */
const Log = {
    /** Whether this log entry has been processed and finalized */
    ready: false,

    /** Primary log level (e.g., "info", "error") */
    level: "info" as LogLevel,

    /** Additional log levels applied to this entry (optional) */
    subLevels: [] as LogLevel[],

    /** Arbitrary context object for user metadata (e.g., request ID, tags) */
    context: {} as Record<string, any>,


    /** Log Specific configuration object  */
    config: {} as Record<string, any>,


    /** Log message fragments; to be joined or rendered later */
    message: [] as string[],

    /** Captured stack trace info from the log emitter's callsite */
    meta: undefined as unknown as StackInfo,

    /** Runtime environment in which the log was created (node, bun, browser...) */
    env: DevVariables.detectEnv(),

    /** ISO string or timestamp representing log creation time */
    timestamp: undefined as unknown as string,

    /** Unique symbol to identify this log instance (for deduplication or tracking) */
    identifyer: undefined as unknown as Symbol,
};

/**
 * Type representing the log schema structure.
 * Derived directly from the `Log` object above.
 */
export type LogSchema = typeof Log;

/**
 * Runtime-typed and validated Log instance structure.
 * This struct enforces the correct types at runtime and supports shape-aware introspection.
 * 
 * Validation:
 * - `identifyer` must be a Symbol
 * - `timestamp` must be a valid date string (ISO or parseable)
 */
export const LogInstance = createStructFromShape(Log, function () {
    if (typeof this.identifyer !== "symbol") {
        throw new TypeError(
            writeMonitextError(
                "LogInstance",
                'expected a symbol as "identifyer"; received: ',
                this.identifyer?.toString(),
            ),
        );
    }

    if (typeof this.timestamp !== "string" || !isValidDate(this.timestamp)) {
        throw new TypeError(
            writeMonitextError(
                "LogInstance",
                'expected an ISO string or any valid form of date as "timestamp"; received: ',
                this.timestamp?.toString(),
            ),
        );
    }
});
