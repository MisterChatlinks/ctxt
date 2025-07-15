import { type MoniTextEventBus } from "../core/event";
import { convertTime, writeTimeString } from "../utils/time/main";
import { isPositiveNumber, isAsyncFunction } from "../utils/types/main";
import { lookUpInStack, type StackInfo } from "../utils/stack/main";
import { MonitextResult } from "../core/result";
import { LogInstance, LogLevel } from "../structs/log";

export type ProfilerParam = { expectDuration: number; forAverageOf?: number };

/**
 * A generic Profiler class used to measure and log the performance of synchronous
 * and asynchronous functions. It tracks execution times, calculates averages,
 * and emits logs for profiling insights.
 *
 * @template T - The return type of the function being profiled.
 */
export class Profiler<T, U extends any[]> {

    constructor(
        fn: (...args: U) => T | Promise<T>,
        private target: MoniTextEventBus,
        param: ProfilerParam,
    ) {

        const isAsync = isAsyncFunction(fn);

        if (isAsync) {
            this.body = this.loadAsAsync(fn as (...args: U) => Promise<T>, param);
        } else {
            this.body = this.loadAsSync(fn as (...args: U) => T, param);
        }
    }

    private callRecord: number[] = [];

    private body: ReturnType<
        Profiler<T, U>["loadAsAsync"] | Profiler<T, U>["loadAsSync"]
    >;

    /**
     * Builds and returns the profiled function.
     */
    public build() {
        return this.body;
    }

    /**
     * Updates the profiling statistics after a function call.
     */
    private async updateProfile(
        duration: number,
        expectedDuration: number,
        average: number,
        stack: StackInfo,
    ) {
        this.callRecord.push(duration);

        if (this.callRecord.length !== average) {
            return;
        }

        const bestCase = writeTimeString(
            convertTime(Math.min(...this.callRecord)),
        );
        const worstCase = writeTimeString(
            convertTime(Math.max(...this.callRecord)),
        );
        const totalTime = this.callRecord.reduce((previous, current) =>
            previous + current
        );

        const averageTime = writeTimeString(convertTime(totalTime / average));
        const averageConsecutiveTime = writeTimeString(convertTime(totalTime));
        const callPercentageInExpectedRange = this.callRecord.filter(call => call < expectedDuration).length / average // as average = callRecord.length
        const callPercentage = (callPercentageInExpectedRange * 100).toFixed(1) + "%";

        const message =
            `[Profiler] ${average} calls completed in ${averageConsecutiveTime}:\n\n` +
            ` • Average time per call: ${averageTime}\n` +
            ` • Fastest: ${bestCase}, Slowest: ${worstCase}\n` +
            ` • ${callPercentage} of calls completed within expected time range (expected: ≤ ${writeTimeString(convertTime(expectedDuration))})`;

        this.emit("info", message, stack);
    }

    /**
     * Reports a profiling error by emitting an error log.
     */
    private async repportProfilingError(error: Error, stack: StackInfo) {
        this.emit(
            "error",
            `[Profiler][Error: (${error.name})]: ${error.message}`,
            stack,
        );
    }

    /**
     * Reports a timing discrepancy when the execution time exceeds the expected duration.
     */
    private async reportTimingDiscrepancy(
        duration: number,
        expectedDuration: number,
        stack: StackInfo,
    ) {
        const receivedTime = convertTime(duration);
        const expectedTime = convertTime(expectedDuration);
        this.emit(
            "warn",
            `[Profiling Warning] Execution time exceeded. Expected: ${writeTimeString(expectedTime)
            }, actual: ${writeTimeString(receivedTime)}`,
            stack,
        );
    }

    /**
     * Emits a log entry to the target event bus.
     */
    private emit(level: LogLevel, message: string, meta: StackInfo) {
        this.target.handle(
            new LogInstance({
                level: "profile",
                subLevels: [level],
                message: Array.isArray(message) ? message : [message],
                meta,
                ready: true,
                identifyer: Symbol(),
                timestamp: new Date().toISOString()
            }),
        );
    }

    /**
     * Loads the function as an asynchronous profiled function.
     */
    private loadAsAsync(
        fn: (...args: U) => Promise<T>,
        { expectDuration, forAverageOf }: ProfilerParam,
    ) {
        const self = this;

        return async (...args: U): Promise<MonitextResult<T>> => {
            let result,
                error: undefined | Error,
                start!: number,
                duration: number;

            const stack = lookUpInStack({
                node: 2,
                deno: 2,
                bun: 3,
                browser: 2,
                defaults: 2,
            }) as StackInfo;

            try {
                start = start = Date.now();
                result = await fn(...args);
                duration = Date.now() - start;
            } catch (e) {
                duration = Date.now() - start;
                error = e as Error;
            }

            if (error) {
                self.repportProfilingError(error, stack);
                return MonitextResult.fail(error);
            } else {
                (async () => {
                    if (
                        isPositiveNumber(expectDuration) &&
                        expectDuration < duration
                    ) {
                        self.reportTimingDiscrepancy(
                            duration,
                            expectDuration,
                            stack,
                        );
                    }
                    if (isPositiveNumber(forAverageOf as number)) {
                        self.updateProfile(
                            duration,
                            expectDuration,
                            forAverageOf as number,
                            stack,
                        );
                    }
                })();
            }

            return MonitextResult.ok<T>(result as Awaited<T>);
        };
    }

    /**
     * Loads the function as a synchronous profiled function.
     */
    private loadAsSync(
        fn: (...args: U) => T,
        { expectDuration, forAverageOf }: ProfilerParam,
    ) {
        const self = this;

        return (...args: U): MonitextResult<T> => {
            let result,
                error: undefined | Error,
                start!: number,
                duration: number;

            const stack = lookUpInStack({
                node: 2,
                deno: 2,
                bun: 2,
                browser: 2,
                defaults: 2,
            }) as StackInfo;

            try {
                start = start = Date.now();
                result = fn(...args);
                duration = Date.now() - start;
            } catch (e) {
                duration = Date.now() - start;
                error = e as Error;
            }

            if (error) {
                self.repportProfilingError(error, stack);
                return MonitextResult.fail(error);
            } else {
                (async () => {
                    if (
                        isPositiveNumber(expectDuration) &&
                        expectDuration < duration
                    ) {
                        self.reportTimingDiscrepancy(
                            duration,
                            expectDuration,
                            stack,
                        );
                    }
                    if (isPositiveNumber(forAverageOf as number)) {
                        self.updateProfile(
                            duration,
                            expectDuration,
                            forAverageOf as number,
                            stack,
                        );
                    }
                })();
            }

            return MonitextResult.ok<T>(result as T);
        };
    }
}
