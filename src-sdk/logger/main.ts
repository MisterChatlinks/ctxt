import { MoniTextEventBus } from "../core/event";
import { LogInstance, LogLevel } from "../structs/log";
import { lookUpInStack, StackInfo } from "../utils/stack/main";
import { ChainableLogInterface } from "./chain";
import { Profiler, ProfilerParam } from "./profiler";
import { Tracer } from "./tracer";
import { ChainableLogFn, CompactLogFn, LoggingMode } from "./types";

type ModeToLogger<T extends LoggingMode> = T extends "compact" ? CompactLogFn
  : T extends "chainable" ? ChainableLogFn
  : never;

export class MonitextLoggingInterface<
  M extends LoggingMode = "compact" | "chainable",
> {
  info!: ModeToLogger<M>;
  warn!: ModeToLogger<M>;
  error!: ModeToLogger<M>;
  fatal!: ModeToLogger<M>;
  success!: ModeToLogger<M>;
  failure!: ModeToLogger<M>;

  private commonLevel = [
    "info",
    "warn",
    "error",
    "fatal",
    "success",
    "failure",
  ] as const;

  constructor(protected bus: MoniTextEventBus, public mode: M) {
    for (const level of this.commonLevel) {
      (this as any)[level] = mode === "compact"
        ? this.createCompactLogEmitter(level)
        : this.createChainableLogEmitter(level);
    }
  }

  private createCompactLogEmitter(type: LogLevel): CompactLogFn {
    return (message, param) => {
      let { config, context } = param || {};

      if (context) {
        context = typeof context === "object" ? context : { $value: context };
      }

      const log = new LogInstance({
        level: type,
        message: [message],
        context,
        meta: lookUpInStack(2) as StackInfo,
        config,
        ready: true,
        identifyer: Symbol(),
        timestamp: new Date().toISOString(),
      });

      this.bus.handle(log);
      return log;
    };
  }

  private createChainableLogEmitter(type: LogLevel): ChainableLogFn {
    const self = this;
    return ((...message: string[]) => {
      const chain = new ChainableLogInterface({
        log: new LogInstance({
          message,
          level: type,
          meta: lookUpInStack({
            bun: 2,
            node: 2,
            deno: 2,
            browser: 2,
            defaults: 2,
          }) as StackInfo,
          ready: true,
          identifyer: Symbol(),
          timestamp: new Date().toISOString(),
        }),
        onSubmit(result) {
          const { context } = result || {};
          if (context) {
            result.context = typeof context === "object"
              ? context
              : { $value: context };
          }
          self.bus.handle(new LogInstance(result));
        },
      });

      return chain;
    }) as unknown as ChainableLogFn;
  }

  profile<U, T extends any[]>(
    fn: (...args: T) => U | Promise<U>,
    param: ProfilerParam,
  ) {
    return new Profiler<U, T>(fn, this.bus, param).build();
  }

  trace<U, T extends any[]>(
    fn: (...args: T) => U | Promise<U>,
    _param: ProfilerParam,
  ) {
    //@ts-ignore
    return new Tracer<U, T>(fn).build();
  }

}
