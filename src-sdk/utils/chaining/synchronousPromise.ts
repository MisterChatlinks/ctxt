import { isAsyncFunction } from "../types/isOfType";

const c = {
    fn: function () { }
}

const fn = c.fn

isAsyncFunction(fn)

class Job {
    constructor(
        public name: string,
        public ready: boolean = false
    ) { }
}

class SynchronousPromiseReference<T> {
    constructor(
        public jobs: Record<string, Job>,
        public submit?: (arg: T) => unknown,
    ) { }

    public param!: T;
    public scheduled: boolean = false;
    public interval!: NodeJS.Timeout | null;
    public resolveCallback?: (value: unknown) => void;
}

interface SynchronousPromise<T extends Record<string, unknown>> {
    [key: string]: SynchronousPromiseReference<T> | SynchronousPromise<T> | ((...args: any[]) => any);
}

/**
 * @purpose Method chaining resolution in async-aware fluent APIs
 * 
 * The following class is meant to resolve a core issue with function chaining
 * when asynchronous operations are involved.
 * 
 * In MoniText, users are allowed to:
 * - log a message
 * - add a config
 * - add a context
 * 
 * Example (standard chaining):
 * ```ts
 * monitext
 *   .error("Did something just broke?")
 *   .context({ trace: getAppTrace() })
 *   .config({ use: ["sms"] });
 * ```
 * 
 * But this becomes problematic when `await` is used in the middle:
 * ```ts
 * monitext
 *   .error("Did something just break remotely?")
 *   .context({ trace: await getAppTrace() }) <---- right here
 *   .config({ use: ["sms"] });
 * ```
 * 
 * Problem:
 * --------
 * Since each chained method modifies shared internal data (i.e., a log instance),
 * a delayed `await` may cause the log to be submitted **before** all data (like
 * context or config) is attached.
 * 
 * Solution:
 * ---------
 * We use JavaScript’s `Proxy` to intercept **property access**.
 * Why intercept property access?
 *  - JavaScript does **not** allow detection of whether a function will be called.
 *  - However, when accessing a method like `.context`, JS performs:
 *      1. Object access
 *      2. Property lookup
 *      3. Optional function call
 * 
 * With a Proxy, we can hook into **step 2**, meaning we know **when**
 * `.context` or `.config` is accessed — even before it’s called.
 * 
 * This enables us to:
 *  - Mark each step (`context`, `config`) as "not ready" upon access
 *  - Mark it "ready" once the actual method executes
 *  - Use `setInterval` polling to check readiness before submitting
 *  - Prevent premature log submission, even in async chain scenarios
 * 
 * In short: this Proxy-based builder safely supports hybrid **async + sync**
 * chains without race conditions or data loss. It technically behave like a promise, as it's awaitable 
 * but, on contrary to promise the chain is unbreakable, (eg, data is only submited when all flag are up)
 * 
 */
export class SynchronousPromiseChain<T extends Record<string, unknown>> implements SynchronousPromise<T> {

    [key: string]: any;

    protected ref: SynchronousPromiseReference<T>;

    constructor(submit: (arg: T) => unknown, private chainStrength = 10) {
        this.ref = new SynchronousPromiseReference<T>({}, submit);
    }

    /** 
     * Initialize jobs manually after subclass defines methods 
     **/
    protected initJobs(methods: string[]) {
        const jobMap: Record<string, Job> = {};
        for (const key of methods) {
            jobMap[key] = new Job(key, true);
        }
        this.ref.jobs = jobMap;
        this.scheduleIfReady() // <- start the polling loop as soon as the job are defiend

        return this.createProxy(); // Begin chain
    }

    private scheduleIfReady(): void {
        if (this.ref.scheduled === true) return;
        this.ref.scheduled = true;

        this.ref.interval = setInterval(() => {
            const allReady = Object.values(this.ref.jobs).every(j => j.ready === true);
            if (!allReady) return;
            this.submit();
            clearInterval(this.ref.interval!);
        },
            this.chainStrength);
    }

    private async submit() {
        if (typeof this.ref.submit == "function") {
            const result = await this.ref.submit(this.ref.param);
            if (this.ref.resolveCallback) {
                this.ref.resolveCallback(result);
            }
        }

    }

    public then(resolve: (value: unknown) => void, _reject?: (reason?: any) => void): void {
        this.ref.resolveCallback = resolve;
    }

    protected createProxy(): this {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);



                if (typeof value === "function" && this.ref.jobs[prop as string]) {
                    this.ref.jobs[prop as string].ready = false;

                    return (...args: any[]) => {
                        /**
                         * The outputed function, above is synchronously callable, but asynchronously resoveld below.
                        */

                        (async () => {
                            const func = value as Function;


                            if (isAsyncFunction(value)) {
                                await func.apply(target, args);
                            } else {
                                func.apply(target, args);
                            }


                            this.ref.jobs[prop as string].ready = true;
                            this.scheduleIfReady();
                        })();

                        return this.createProxy();
                    };
                }

                return value;
            }
        });
    }
}
